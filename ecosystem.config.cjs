// PM2 process for the live site. Started by scripts/server/deploy.sh.
// Listens on localhost only; nginx in front serves guestposting.live.
module.exports = {
  apps: [
    {
      name: 'guestposting',
      cwd: __dirname,
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3100 -H 127.0.0.1',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      max_memory_restart: '800M',
      env: { NODE_ENV: 'production' },
    },
  ],
};
