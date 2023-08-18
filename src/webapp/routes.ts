import { Route, createRouter, defineRoute, param } from "type-route";

export const {
    RouteProvider: RouteProvider,
    useRoute: useRoute,
    routes: routes,
} = createRouter({
    home: defineRoute("/"),
    counter: defineRoute({ id: param.path.string }, params => `/counter/${params.id}`),
});

export type Routes = Route<typeof routes>;
