import React from "react";
import { Route } from "type-route";

import { routes } from "../routes";
import { useAppActions, useAppState } from "../AppStore";
import { Counter } from "../../domain/entities/Counter";
import { buildStyles, component, Element } from "../utils/react";

interface CounterPageProps {
    route: Route<typeof routes.counter>;
}

function CounterPage(props: CounterPageProps): Element {
    const counter = useAppState(state => state.counters.get({ id: props.route.params.id }));
    return counter ? <CounterContents counter={counter} /> : <>Loading...</>;
}

function CounterContents(props: { counter: Counter }): Element {
    const { counter } = props;
    const counterActions = useCounterActions(counter);

    return (
        <div className="App">
            <div className="card">
                <button data-testid="increment-counter" onClick={counterActions.decrement}>
                    -1
                </button>

                <span data-testid="counter-value" style={styles.value}>
                    {counter.value}
                </span>

                <button data-testid="decrement-counter" onClick={counterActions.increment}>
                    +1
                </button>
            </div>
        </div>
    );
}

const styles = buildStyles({
    value: { padding: 10 },
});

function useCounterActions(counter: Counter) {
    const actions = useAppActions();

    return React.useMemo(() => {
        return {
            increment: () => actions.increment(counter.id),
            decrement: () => actions.decrement(counter.id),
        };
    }, [actions, counter.id]);
}

export default component(CounterPage);
