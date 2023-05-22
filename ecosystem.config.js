module.exports = {
  apps: [
    {
      name: "XFUNdmate",
      script: "./bin/www",
      // args: '',
      // exec_mode: "cluster",
      // instances:6,
      // autorestart: true,
      // watch: true,
      // max_memory_restart: '1G',
      env: {
        PORT: 3000,
        NODE_ENV: "dev",
      },
      env_test: {
        PORT: 3000,
        NODE_ENV: "test",
      },
      env_production: {
        PORT: 3000,
        NODE_ENV: "production",
      },
    },
  ],
};
