module.exports = {
  forbidden: [
    { name: "no-circular", severity: "error", from: {}, to: { circular: true } },
    { name: "no-orphans", severity: "warn", from: { orphan: true, pathNot: "(?:^|/)(?:main|vite-env\.d|.*\.test)\.[jt]sx?$" }, to: {} },
  ],
  options: { doNotFollow: { path: "node_modules" }, tsConfig: { fileName: "tsconfig.app.json" } },
};
