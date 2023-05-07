import React from "react";
import HomePage from "./pages/HomePage";
import CounterPage from "./pages/CounterPage";
import { Routes, routes, useRoute } from "./routes";
import { useAppActions } from "./AppStore";

type JSX = React.ReactElement<any, any>;

function Router(): JSX {
    const route = useRoute();
    useRoutesLoading(route);

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

function NavLink<T extends Routes>(props: { title: string; route: T }): JSX {
    const route = useRoute();
    const isCurrent = props.route.href === route.href;
    return isCurrent ? <span>{props.title}</span> : <a {...props.route.link}>{props.title}</a>;
}

function useRoutesLoading(route: Routes) {
    const actions = useAppActions();

    React.useEffect(() => {
        actions.onEnter(route);
    }, [actions, route]);
}

function ComponentByRoute(props: { route: Routes }): JSX {
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
