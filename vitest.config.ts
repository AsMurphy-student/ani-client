import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    workspace: [
      {
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.ts"],
        },
      },
      {
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
          testTimeout: 30_000,
        },
      },
    ],
    coverage: {
      include: ["src/**/*.ts"],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
      },
    },
  },
});
