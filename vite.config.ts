/// <reference types="vitest" />
import { defineConfig, loadEnv } from "vite";
import eslint from "vite-plugin-eslint";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";

// https://vitejs.dev/config/

export default ({ mode }) => {
    const env = { ...process.env, ...loadEnv(mode, process.cwd()) };

    return defineConfig({
        plugins: [
            react(),
            eslint(),
            checker({
                typescript: true,
                eslint: {
                    lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
                    dev: { logLevel: ["error"] },
                },
            }),
        ],
        test: {
            environment: "jsdom",
            setupFiles: "./src/tests/setup.js",
            exclude: ["node_modules", "src/tests/playwright"],
            globals: true,
        },
        server: {
            port: parseInt(env.VITE_PORT),
            proxy: {
                "/api": {
                    target: "https://jsonplaceholder.typicode.com",
                    changeOrigin: true,
                    rewrite: path => path.replace(/^\/api/, ""),
                },
            },
        },
    });
};
