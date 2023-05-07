import "./App.css";
import React from "react";
import { RouteProvider } from "./routes";
import Router from "./Router";
import { AppActions, AppState, useAppStore } from "./AppStore";
import { Counter } from "../domain/entities/Counter";
import { IndexedSet } from "../domain/entities/generic/IndexedSet";

const initialState: AppState = {
    counters: IndexedSet.fromArray(
        [Counter.create({ id: "1", value: 1 }), Counter.create({ id: "2", value: 2 })],
        (obj: { id: string }) => obj.id,
    ),
};

function App() {
    const [AppProvider] = useAppStore(accessors => ({
        initialState: initialState,
        actions: new AppActions(accessors.set), // Move to buildStore and pass here only args?
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
