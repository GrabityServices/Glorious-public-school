const { execSync } = require("child_process");

// Free default school application ports
const targetPorts = process.env.PORT ? [Number(process.env.PORT)] : [3000, 3001, 5000, 5001];

console.log(`Checking ports: ${targetPorts.join(", ")}...`);

for (const port of targetPorts) {
  try {
    if (process.platform === "win32") {
      const output = execSync(
        `powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue).OwningProcess"`,
        { encoding: "utf8" }
      ).trim();

      if (output) {
        const pids = [...new Set(output.split(/\r?\n/).map((p) => p.trim()).filter((p) => p && p !== "0"))];
        for (const pid of pids) {
          try {
            execSync(`powershell -NoProfile -Command "Stop-Process -Id ${pid} -Force"`);
            console.log(`✅ Terminated process ${pid} using port ${port}.`);
          } catch (e) {
            console.warn(`Could not terminate process ${pid}: ${e.message}`);
          }
        }
      } else {
        console.log(`✅ Port ${port} is already free.`);
      }
    } else {
      try {
        execSync(`lsof -ti:${port} | xargs kill -9`);
        console.log(`✅ Freed port ${port}.`);
      } catch {
        console.log(`✅ Port ${port} is already free.`);
      }
    }
  } catch (err) {
    console.log(`Port ${port} check finished.`);
  }
}

console.log("All port checks completed.");
