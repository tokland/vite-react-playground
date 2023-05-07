import { buildStore, GetState, SetState } from "./hooks/GenericStore";
import { Counter } from "../domain/entities/Counter";
import { Routes } from "./routes";
import { IndexedSet } from "../domain/entities/generic/IndexedSet";
import { CompositionRoot } from "../compositionRoot";
import { Cancel, noCancel } from "../domain/entities/generic/Async";

export interface AppState {
    counters: IndexedSet<Counter, { id: string }>;
}

export class AppActions {
    constructor(
        private get: GetState<AppState>,
        private set: SetState<AppState>,
        private compositionRoot: CompositionRoot,
    ) {}

    increment(counterId: string) {
        const counter = this.get().counters.get({ id: counterId });
        return this.saveCounter(counter?.add(+1));
    }

    decrement(counterId: string): Cancel {
        const counter = this.get().counters.get({ id: counterId });
        return this.saveCounter(counter?.add(-1));
    }

    onEnter(routes: Routes) {
        switch (routes.name) {
            case "counter":
                this.compositionRoot.counters.get.execute(routes.params.id).run(
                    counter => this.set(state => ({ counters: state.counters.add(counter) })),
                    err => console.error(err),
                );
                return null;
            default:
                return null;
        }
    }

    private saveCounter(counter: Counter | undefined): Cancel {
        if (!counter) return noCancel;

        this.set(state => ({ counters: state.counters.add(counter) }));

        return this.compositionRoot.counters.save.execute(counter).run(
            _counter => {},
            err => console.error(err),
        );
    }
}

const [useAppStore, useAppState, useAppActions] = buildStore<AppState, AppActions>();
// ({ actions: (accessors, options: { compositionRoot: CompositionRoot }) => new Actions(accessors.set, options.compositionRoot) })
// buildStore(initialValue, actionsOptions: { compositionRoot })

export { useAppStore, useAppState, useAppActions };
