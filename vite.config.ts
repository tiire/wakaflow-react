import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: [
      "497c5b14-4f72-4d53-86ef-0740c48b39d6-00-1d49fhsbl6nyx.riker.replit.dev",
    ],
  },
});
