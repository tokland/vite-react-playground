import { Route } from "type-route";
import { routes } from "../routes";
import { useAppActions, useAppState } from "../AppStore";
import React from "react";

interface CounterPageProps {
    route: Route<typeof routes.counter>;
}

function CounterPage(props: CounterPageProps) {
    const counter = useAppState(state => state.counters.get({ id: props.route.params.id }));
    const actions = useAppActions();
    if (!counter) return null;

    return (
        <div className="App">
            <div className="card">
                <button onClick={() => actions.decrement(counter.id)}>-1</button>

                <span data-testid="counter-value" style={styles.value}>
                    {counter.value}
                </span>

                <button onClick={() => actions.increment(counter.id)}>+1</button>
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
