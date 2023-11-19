module.exports = {
  apps: [
    {
      name: "api-ksm-v1-accounting-and-factory",
      script: "index.js",
      node_args: "--max-old-space-size=8192 --nouse-idle-notification --no-deprecation"
    },
  ],
};