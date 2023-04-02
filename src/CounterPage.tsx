import { useState } from "react";
import { Route } from "type-route";
import { routes } from "./router";

interface CounterPageProps {
    route: Route<typeof routes.counter>;
}

function Counter(props: CounterPageProps) {
    const [count, setCount] = useState(0);
    const { route } = props;

    return (
        <div className="App">
            <div className="card">
                ID={route.params.id}
                <button onClick={() => setCount(count => count - 1)}>DEC</button>
                <button onClick={() => setCount(count => count + 1)}>INC</button>
                {count}
            </div>
        </div>
    );
}

export default Counter;
