import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import * as stylex from "@stylexjs/stylex";
const pageStyles = stylex.create({
  body: {
    margin: 0,
    fontFamily: "Inter,ui-sans-serif,system-ui,sans-serif",
    fontSynthesis: "none",
  },
});
document.body.className = stylex.props(pageStyles.body).className ?? "";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
