import "./App.css";
import React from "react";
import { RouteProvider } from "./routes";
import Router from "./Router";
import { AppActions, AppState, useAppStore } from "./AppStore";
import { IndexedSet } from "../domain/entities/generic/IndexedSet";
import { getCompositionRoot } from "../compositionRoot";

const initialState: AppState = {
    counters: IndexedSet.fromArray([], (ref: { id: string }) => ref.id),
};

function App() {
    const compositionRoot = React.useMemo(() => getCompositionRoot(), []);

    const [AppProvider] = useAppStore(accessors => ({
        initialState: initialState,
        // Move to buildStore and pass here only the args?
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
