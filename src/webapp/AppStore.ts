import { buildStore, GetState, SetState } from "./hooks/GenericStore";
import { Counter } from "../domain/entities/Counter";
import { Routes } from "./routes";
import { IndexedSet } from "../domain/entities/generic/IndexedSet";
import { CompositionRoot } from "../compositionRoot";
import { Cancel, noCancel } from "../domain/entities/generic/Async";
import { Ref } from "../domain/entities/Base";

export interface AppState {
    counters: IndexedSet<Counter, Ref>;
}

export class AppActions {
    constructor(
        private get: GetState<AppState>,
        private set: SetState<AppState>,
        private compositionRoot: CompositionRoot,
    ) {}

    get state() {
        return this.get();
    }

    increment(counterId: string) {
        const counter = this.state.counters.get({ id: counterId });
        return this.saveCounter(counter?.add(+1));
    }

    decrement(counterId: string): Cancel {
        const counter = this.state.counters.get({ id: counterId });
        return this.saveCounter(counter?.add(-1));
    }

    loadByRoute(route: Routes) {
        switch (route.name) {
            case "counter":
                return this.compositionRoot.counters.get.execute(route.params.id).run(
                    counter => this.set(state => ({ counters: state.counters.update(counter) })),
                    err => console.error(err),
                );
        }
    }

    private saveCounter(counter: Counter | undefined): Cancel {
        if (!counter) return noCancel;

        this.set(state => ({ counters: state.counters.update(counter) }));

        return this.compositionRoot.counters.save.execute(counter).run(
            _counter => {},
            err => console.error(err),
        );
    }
}

const [useAppStore, useAppState, useAppActions] = buildStore<AppState, AppActions>();

export { useAppStore, useAppState, useAppActions };
