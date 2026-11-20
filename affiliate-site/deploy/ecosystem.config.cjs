// PM2 process file. Started by deploy/deploy.sh.
// Next.js reads ../.env automatically. One instance only (SQLite = single writer).
const path = require("path");

module.exports = {
  apps: [
    {
      name: "clearcompare",
      cwd: path.join(__dirname, ".."),
      script: "node_modules/next/dist/bin/next",
      args: "start -H 127.0.0.1 -p 3000",
      instances: 1,
      exec_mode: "fork",
      env: { NODE_ENV: "production" },
      max_memory_restart: "700M",
      time: true,
    },
  ],
};
