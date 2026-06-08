import { createRoot } from "react-dom/client";
import { ChatWidget } from "./ChatWidget";
import "./styles/widget.css";

createRoot(document.getElementById("root")!).render(<ChatWidget />);
