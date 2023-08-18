import "./App.css";
import React from "react";
import { RouteProvider } from "./routes";
import Router from "./Router";
import { AppActions, AppState, useAppStore } from "./AppStore";
import { CompositionRoot } from "../compositionRoot";
import * as entities from "../domain/entities";

const initialState: AppState = {
    counters: entities.Counters.empty(),
};

function App(props: { compositionRoot: CompositionRoot }) {
    const { compositionRoot } = props;

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
