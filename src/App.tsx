import "./App.css";
import React from "react";
import { RouteProvider } from "./routes";
import Router from "./Router";
import { AppActions, AppState, useAppStore } from "./AppStore";
import { Counter } from "./domain/entities/Counter";
import { HashMap } from "./domain/entities/Generic/HashMap";

const initialState: AppState = {
    counters: HashMap.fromObject<string, Counter>({
        "1": Counter.create({ id: "1", value: 1 }),
        "2": Counter.create({ id: "2", value: 2 }),
    }),
};

function App() {
    const [AppProvider] = useAppStore(accessors => ({
        initialState: initialState,
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
