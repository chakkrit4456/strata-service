module.exports = {
  apps: [{ name: "strata", cwd: "/var/www/strata", script: "npm", args: "start", env: { NODE_ENV: "production", PORT: 3000 } }],
};
