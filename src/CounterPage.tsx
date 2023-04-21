import { Route } from "type-route";
import { routes } from "./router";
import { useCounterStore } from "./CounterStore";

interface CounterPageProps {
    route: Route<typeof routes.counter>;
}

function Counter(props: CounterPageProps) {
    const actions = useCounterStore(state => state.actions);
    const value = useCounterStore(state => state.value);
    const { route } = props;

    return (
        <div className="App">
            <div className="card">
                ID={route.params.id}
                <button onClick={() => actions.add(-1)}>DEC</button>
                <button onClick={() => actions.add(+1)}>INC</button>
                {value}
            </div>
        </div>
    );
}

export default Counter;
