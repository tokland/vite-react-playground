import React from "react";
import { Routes, routes, useRoute } from "./routes";
import { useAppActions } from "./AppStore";
import { Element } from "./utils/react";

const HomePage = React.lazy(() => import("./pages/HomePage"));
const CounterPage = React.lazy(() => import("./pages/CounterPage"));

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

            <React.Suspense>
                <ComponentByRoute route={route} />
            </React.Suspense>
        </>
    );
}

function NavLink<T extends Routes>(props: { title: string; route: T }): Element {
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

function ComponentByRoute(props: { route: Routes }): Element {
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
