import { buildStore, SetState } from "./GenericStore";
import { Counter } from "./domain/entities/Counter";
import { HashMap } from "./domain/entities/Generic/HashMap";

interface AppState {
    counters: HashMap<string, Counter>;
}

export class AppActions {
    constructor(private set: SetState<AppState>) {}

    increment = (counterId: string) =>
        this.set(state => {
            const counter = state.counters.get(counterId);
            return counter ? { counters: state.counters.set(counterId, counter.add(+1)) } : state;
        });

    decrement = (counterId: string) =>
        this.set(state => {
            const counter = state.counters.get(counterId);
            return counter ? { counters: state.counters.set(counterId, counter.add(-1)) } : state;
        });
}

const [useAppStore, useAppState, useAppActions] = buildStore<AppState, AppActions>();

export { useAppStore, useAppState, useAppActions };
