import { defineConfig, loadEnv } from "vite";
import eslint from "vite-plugin-eslint";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/

export default ({ mode }) => {
    const env = { ...process.env, ...loadEnv(mode, process.cwd()) };

    return defineConfig({
        plugins: [react(), eslint()],

        server: {
            port: parseInt(env.VITE_PORT),
        },
    });
};
