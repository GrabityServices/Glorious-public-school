const { execSync } = require("child_process");

const port = process.env.PORT || 5000;
console.log(`Checking port ${port}...`);

try {
  if (process.platform === "win32") {
    const output = execSync(
      `powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue).OwningProcess"`,
      { encoding: "utf8" }
    ).trim();

    if (output) {
      const pids = [...new Set(output.split(/\r?\n/).map((p) => p.trim()).filter(Boolean))];
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
