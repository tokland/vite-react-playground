import { buildStore, SetState } from "./hooks/GenericStore";
import { Counter } from "../domain/entities/Counter";
import { Routes } from "./routes";
import { IndexedSet } from "../domain/entities/generic/IndexedSet";

export interface AppState {
    counters: IndexedSet<Counter, { id: string }>;
}

export class AppActions {
    constructor(private set: SetState<AppState>) {}

    increment(counterId: string) {
        this.set(state => {
            const counter = state.counters.get({ id: counterId });
            return counter ? { counters: state.counters.add(counter.add(+1)) } : state;
        });
    }

    decrement(counterId: string) {
        this.set(state => {
            const counter = state.counters.get({ id: counterId });
            return counter ? { counters: state.counters.add(counter.add(-1)) } : state;
        });
    }

    onEnter(routes: Routes): null {
        switch (routes.name) {
            case "counter":
                console.debug("Load counter");
                return null;
            default:
                return null;
        }
    }
}

const [useAppStore, useAppState, useAppActions] = buildStore<AppState, AppActions>();
// ({ actions: (accessors, options: { compositionRoot: CompositionRoot }) => new Actions(accessors.set, options.compositionRoot) })
// buildStore(initialValue, actionsOptions: { compositionRoot })

export { useAppStore, useAppState, useAppActions };
