import React from "react";
import { AppRoute, routes, useRoute } from "./routes";
import { useAppActions } from "./AppStore";
import { Element } from "./utils/react";
import HomePage from "./pages/HomePage";
import CounterPage from "./pages/CounterPage";

const exampleOfEnvVarUsage = import.meta.env.VITE_EXAMPLE1;

function Router(): Element {
    const route = useRoute();
    useRoutesLoading();

    return (
        <>
            <nav>
                <NavLink title="Home" route={routes.home()} />|
                <NavLink title="Counter 1" route={routes.counter({ id: "1" })} />|
                <NavLink title="Counter 2" route={routes.counter({ id: "2" })} />
            </nav>

            <ComponentByRoute route={route} />
        </>
    );
}

function NavLink<Route extends AppRoute>(props: { title: string; route: Route }): Element {
    const route = useRoute();
    const isCurrent = props.route.href === route.href;

    return isCurrent ? <span>{props.title}</span> : <a {...props.route.link}>{props.title}</a>;
}

function useRoutesLoading() {
    const route = useRoute();
    const actions = useAppActions();

    React.useEffect(() => {
        actions.loadByRoute(route);
    }, [actions, route]);
}

function ComponentByRoute(props: { route: AppRoute }): Element {
    const { route } = props;

    switch (route.name) {
        case "home":
            return <HomePage />;
        case "counter":
            return <CounterPage route={route} />;
        case false: {
            return <>Not Found</>;
        }
    }
}

export default React.memo(Router);
