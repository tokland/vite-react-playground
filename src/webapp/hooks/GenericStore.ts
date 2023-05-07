import React from "react";
import { StoreApi, createStore, useStore as useZustandStore } from "zustand";
import { shallow } from "zustand/shallow";

export type SetState<State> = Accessors<State>["set"];

export type GetState<State> = Accessors<State>["get"];

export function buildStore<State, Actions>() {
    const StoreContext = React.createContext<Store<State, Actions> | null>(null);

    function useStore(
        builder: (accessors: Accessors<State>) => { initialState: State; actions: Actions },
    ) {
        const [store] = React.useState(() => {
            return createStore<StoreValue<State, Actions>>()((set, get) => {
                const { initialState, actions } = builder({ set, get });
                return { ...initialState, _actions: actions };
            });
        });

        const ContextProvider = React.useCallback<Component>(
            props => React.createElement(StoreContext.Provider, { value: store }, props.children),
            [store],
        );

        const actions = useStoreActions(store);

        return [ContextProvider, actions, store] as const;
    }

    function useSelector<U>(selector: (state: State) => U, options?: Options): U {
        const store = React.useContext(StoreContext);
        if (!store) throw new Error("Context not initialized");
        return useStoreSelector(store, selector, options);
    }

    function useActions() {
        const store = React.useContext(StoreContext);
        if (!store) throw new Error("Context not initialized");
        return useStoreActions(store);
    }

    return [useStore, useSelector, useActions] as const;
}

export function useStoreSelector<State, Actions, U>(
    store: Store<State, Actions>,
    selector: (state: State) => U,
    options?: Options,
) {
    return useZustandStore(
        store,
        storeValue => selector(storeValue),
        options?.shallow ? shallow : undefined,
    );
}

/* Internal */

type Component = React.FC<{ children: React.ReactNode }>;

interface Accessors<State> {
    set: StoreApi<State>["setState"];
    get: StoreApi<State>["getState"];
}

function useStoreActions<State, Actions>(store: Store<State, Actions>) {
    return useZustandStore(store, storeValue => storeValue._actions);
}

type Options = { shallow?: boolean };

type Store<State, Actions> = StoreApi<StoreValue<State, Actions>>;

type StoreValue<State, Actions> = State & { _actions: Actions };
