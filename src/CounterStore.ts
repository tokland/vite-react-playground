import { create, StoreApi } from "zustand";

interface CounterState {
    value: number;
}

class CounterActions {
    constructor(private set: StoreApi<CounterState>["setState"]) {}

    add(value: number) {
        this.set(state => ({ value: state.value + value }));
    }
}

export const useCounterStore = create<CounterState & { actions: CounterActions }>()(set => ({
    value: 0,
    actions: new CounterActions(set),
}));
