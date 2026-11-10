
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import http from 'http';

const activePortFile = path.resolve(__dirname, '../backend/.active-port');

function getBackendPort() {
  if (process.env.BACKEND_PORT) return Number(process.env.BACKEND_PORT);
  if (process.env.VITE_BACKEND_PORT) return Number(process.env.VITE_BACKEND_PORT);

  // 1. Check dynamic active port
  if (fs.existsSync(activePortFile)) {
    try {
      const p = parseInt(
        fs.readFileSync(activePortFile, 'utf8').trim(),
        10
      );
      if (!isNaN(p) && p > 0) return p;
    } catch {}
  }

  // 2. Check backend/.env
  const envFile = path.resolve(__dirname, '../backend/.env');

  if (fs.existsSync(envFile)) {
    try {
      const envText = fs.readFileSync(envFile, 'utf8');
      const m = envText.match(/^PORT\s*=\s*(\d+)/m);
      if (m) return parseInt(m[1], 10);
    } catch {}
  }

  return 5000;
}

// Dynamic backend proxy plugin
function dynamicBackendProxyPlugin() {
  return {
    name: 'dynamic-backend-proxy',

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const isApi = req.url && req.url.startsWith('/api');
        const isUploads = req.url && req.url.startsWith('/uploads');

        if (!isApi && !isUploads) {
          return next();
        }

        const port = getBackendPort();

        const proxyReq = http.request(
          {
            hostname: '127.0.0.1',
            port,
            path: req.url,
            method: req.method,
            headers: {
              ...req.headers,
              host: `127.0.0.1:${port}`,
            },
          },
          (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
          }
        );

        proxyReq.on('error', (err) => {
          const alternatePort = port === 5000 ? 5001 : 5000;

          if (
            err.code === 'ECONNREFUSED' &&
            (req.method === 'GET' || req.method === 'HEAD')
          ) {
            const fallbackReq = http.request(
              {
                hostname: '127.0.0.1',
                port: alternatePort,
                path: req.url,
                method: req.method,
                headers: {
                  ...req.headers,
                  host: `127.0.0.1:${alternatePort}`,
                },
              },
              (fallbackRes) => {
                try {
                  fs.writeFileSync(
                    activePortFile,
                    String(alternatePort),
                    'utf8'
                  );
                } catch {}

                res.writeHead(
                  fallbackRes.statusCode,
                  fallbackRes.headers
                );
                fallbackRes.pipe(res);
              }
            );

            fallbackReq.on('error', () => {
              if (!res.headersSent) {
                res.writeHead(502, {
                  'Content-Type': 'application/json',
                });
                res.end(
                  JSON.stringify({
                    error: `Backend unreachable on ports ${port} and ${alternatePort}`,
                  })
                );
              }
            });

            fallbackReq.end();
            return;
          }

          if (!res.headersSent) {
            res.writeHead(502, {
              'Content-Type': 'application/json',
            });

            res.end(
              JSON.stringify({
                error: 'Backend proxy error',
                details: err.message,
                targetPort: port,
              })
            );
          }
        });

        req.pipe(proxyReq);
      });
    },
  };
}

const initialPort = getBackendPort();

export default defineConfig({
  plugins: [
    react(),
    dynamicBackendProxyPlugin(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    // Listen only on localhost; Nginx handles public traffic
    host: '127.0.0.1',

    port: 5001,
    strictPort: true,

    // Don't attempt to open a browser on VPS
    open: false,

    // Allow your actual domains
    allowedHosts: [
      'thegloriousschool.in',
      'www.thegloriousschool.in',
    ],

    proxy: {
      '/api': {
        target: `http://127.0.0.1:${initialPort}`,
        changeOrigin: true,
      },

      '/uploads': {
        target: `http://127.0.0.1:${initialPort}`,
        changeOrigin: true,
      },
    },
  },
});
