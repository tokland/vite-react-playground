import React from "react";
import HomePage from "./HomePage";
import CounterPage from "./CounterPage";
import { routes, useRoute } from "./router";
import { Route } from "type-route";

type JSX = React.ReactElement<any, any>;

function Router(): JSX {
    return (
        <>
            <nav>
                <NavLink title="Home" route={routes.home()} />|
                <NavLink title="Counter 1" route={routes.counter({ id: "1" })} />|
                <NavLink title="Counter 2" route={routes.counter({ id: "2" })} />
            </nav>

            <ComponentByRoute />
        </>
    );
}

function NavLink<T extends Route<typeof routes>>(props: { title: string; route: T }): JSX {
    const route = useRoute();
    const isCurrent = props.route.href === route.href;
    return isCurrent ? <span>{props.title}</span> : <a {...props.route.link}>{props.title}</a>;
}

function ComponentByRoute(): JSX {
    const route = useRoute();

    switch (route.name) {
        case "home":
            return <HomePage />;
        case "counter":
            return <CounterPage route={route} />;
        case false: {
            // routes.home().push();
            return <>Not Found</>;
        }
    }
}

export default React.memo(Router);
