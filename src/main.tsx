import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import "@fullcalendar/core/main.css";
import "@fullcalendar/daygrid/main.css";
import "@fullcalendar/timegrid/main.css";

createRoot(document.getElementById("root")!).render(<App />);