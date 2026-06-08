import { createRoot } from "react-dom/client";
import { ChatWidget } from "./ChatWidget";
import "./styles/widget.css";

const container = document.createElement("div");
container.id = "__chat-widget-root__";
document.body.appendChild(container);

createRoot(container).render(<ChatWidget />);
