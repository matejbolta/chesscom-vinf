import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        url: "https://www.chess.com/home"
      }
    },
    include: ["tests/**/*.test.ts"],
    restoreMocks: true
  }
});
