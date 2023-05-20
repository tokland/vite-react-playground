import "./App.css";
import React from "react";
import { RouteProvider } from "./routes";
import Router from "./Router";
import { AppActions, AppState, useAppStore } from "./AppStore";
import { IndexedSet } from "../domain/entities/generic/IndexedSet";
import { getCompositionRoot } from "../compositionRoot";
import { Counter } from "../domain/entities/Counter";
import { getId } from "../domain/entities/Base";

const initialState: AppState = {
    counters: IndexedSet.fromArray([] as Counter[], getId),
};

function App() {
    const compositionRoot = React.useMemo(() => getCompositionRoot(), []);

    const [AppProvider] = useAppStore(accessors => ({
        initialState: initialState,
        actions: new AppActions(accessors.get, accessors.set, compositionRoot),
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
