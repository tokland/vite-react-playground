import { Route } from "type-route";
import { routes } from "./router";
import { useAppActions, useAppState } from "./AppStore";

interface CounterPageProps {
    route: Route<typeof routes.counter>;
}

function CounterPage(props: CounterPageProps) {
    const counter = useAppState(state => state.counters.get(props.route.params.id));
    const actions = useAppActions();
    if (!counter) return null;

    return (
        <div className="App">
            <div className="card">
                <button onClick={() => actions.decrement(counter.id)}>-1</button>
                <span>{counter.value}</span>
                <button onClick={() => actions.increment(counter.id)}>+1</button>
            </div>
        </div>
    );
}

export default CounterPage;
