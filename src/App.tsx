import "./App.css";
import React from "react";
import { RouteProvider } from "./router";
import Router from "./Router";
import { AppActions, useAppStore } from "./AppStore";
import { Counter } from "./domain/entities/Counter";
import { HashMap } from "./domain/entities/Generic/HashMap";

function App() {
    const [AppProvider] = useAppStore(accessors => ({
        initialState: {
            counters: HashMap.fromObject<string, Counter>({
                "1": new Counter({ id: "1", value: 1 }),
                "2": new Counter({ id: "2", value: 2 }),
            }),
        },
        actions: new AppActions(accessors.set),
    }));

    return (
        <div className="App">
            <RouteProvider>
                <AppProvider>
                    <Router />
                </AppProvider>
            </RouteProvider>
        </div>
    );
}

export default React.memo(App);
