import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // All requests starting with /api are proxied to the backend.
      // This eliminates CORS issues in development — the browser sees
      // requests going to the same origin (localhost:3000) while Vite
      // forwards them to the Spring Boot server on port 8080.
      "/api": {
        target: "http://ec2-35-171-169-160.compute-1.amazonaws.com:8080/",
        changeOrigin: true,
      },
    },
  },
});
