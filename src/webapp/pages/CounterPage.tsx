import { Route } from "type-route";
import { routes } from "../routes";
import { useAppActions, useAppState } from "../AppStore";
import React from "react";
import { useCancellableEffect } from "../hooks/useCancellableEffect";
import { Counter } from "../../domain/entities/Counter";
import { ReactElement } from "../utils/react";

interface CounterPageProps {
    route: Route<typeof routes.counter>;
}

function CounterPage(props: CounterPageProps): ReactElement {
    const counter = useAppState(state => state.counters.get({ id: props.route.params.id }));
    return counter ? <CounterContents counter={counter} /> : <>Loading...</>;
}

function CounterContents(props: { counter: Counter }): ReactElement {
    const { counter } = props;
    const actions = useAppActions();
    const counterId = counter.id;

    const [increment] = useCancellableEffect(
        React.useCallback(() => actions.increment(counterId), [actions, counterId]),
    );

    const [decrement] = useCancellableEffect(
        React.useCallback(() => actions.decrement(counterId), [actions, counterId]),
    );

    return (
        <div className="App">
            <div className="card">
                <button onClick={decrement}>-1</button>

                <span data-testid="counter-value" style={styles.value}>
                    {counter.value}
                </span>

                <button onClick={increment}>+1</button>
            </div>
        </div>
    );
}

const styles = buildStyles({
    value: { padding: 10 },
});

function buildStyles<T extends Record<string, React.CSSProperties>>(styles: T): T {
    return styles;
}

export default CounterPage;
