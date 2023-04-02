import "./App.css";
import React from "react";
import HomePage from "./HomePage";
import CounterPage from "./CounterPage";
import { routes, useRoute } from "./router";

function App() {
    const route = useRoute();

    return (
        <>
            <nav>
                <a {...routes.home().link}>Home</a>|
                <a {...routes.counter({ id: "1" }).link}>Counter 1</a>
            </nav>

            {route.name === "home" && <HomePage />}
            {route.name === "counter" && <CounterPage route={route} />}
            {route.name === false && "Not Found"}
        </>
    );
}

export default React.memo(App);
