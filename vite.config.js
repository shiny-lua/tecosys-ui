import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
// https://vitejs.dev/config/
export default defineConfig({
    server: {
    allowedHosts: ['nutaan.com'],
    },
    preview: {
      allowedHosts: ['nutaan.com'], // Add the domain here
    },
    plugins: [react(), tsconfigPaths()],
    optimizeDeps: {
        include: ["remark-breaks"], // Force Vite to pre-bundle this module
      }
});
