import "./App.css";
import React from "react";
import { RouteProvider } from "./router";
import Router from "./Router";

function App() {
    return (
        <div className="App">
            <RouteProvider>
                <Router />
            </RouteProvider>
        </div>
    );
}

export default React.memo(App);
