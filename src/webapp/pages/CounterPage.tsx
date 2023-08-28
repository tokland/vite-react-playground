import React from "react";
import { Route } from "type-route";

import { routes } from "../routes";
import { useAppActions, useAppState } from "../AppStore";
import { Counter } from "../../domain/entities/Counter";
import { buildStyles, Element } from "../utils/react";

interface CounterPageProps {
    route: Route<typeof routes.counter>;
}

function CounterPage(props: CounterPageProps): Element {
    const counter = useAppState(state => state.counters.get({ id: props.route.params.id }));
    return counter ? <CounterContents counter={counter} /> : <>Loading...</>;
}

function CounterContents(props: { counter: Counter }): Element {
    const { counter } = props;
    const actions = useAppActions();

    const increment = React.useCallback(() => actions.increment(counter.id), [actions, counter.id]);
    const decrement = React.useCallback(() => actions.decrement(counter.id), [actions, counter.id]);

    return (
        <div className="App">
            <div className="card">
                <button data-testid="increment-counter" onClick={decrement}>
                    -1
                </button>

                <span data-testid="counter-value" style={styles.value}>
                    {counter.value}
                </span>

                <button data-testid="decrement-counter" onClick={increment}>
                    +1
                </button>
            </div>
        </div>
    );
}

const styles = buildStyles({
    value: { padding: 10 },
});

export default CounterPage;
