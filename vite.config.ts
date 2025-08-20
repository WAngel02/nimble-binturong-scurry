import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [dyadComponentTagger(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      '@fullcalendar/core/main.css': path.resolve(__dirname, 'node_modules/@fullcalendar/core/main.css'),
      '@fullcalendar/daygrid/main.css': path.resolve(__dirname, 'node_modules/@fullcalendar/daygrid/main.css'),
      '@fullcalendar/timegrid/main.css': path.resolve(__dirname, 'node_modules/@fullcalendar/timegrid/main.css'),
    },
  },
}));