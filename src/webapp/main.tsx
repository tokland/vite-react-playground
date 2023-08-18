import React from "react";
import ReactDOM from "react-dom/client";
import { getAppCompositionRoot } from "../compositionRoot";
import App from "./App";
import "./index.css";

const compositionRoot = getAppCompositionRoot();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <App compositionRoot={compositionRoot} />
    </React.StrictMode>,
);
