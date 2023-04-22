import { createRouter, defineRoute, param } from "type-route";

export const { RouteProvider, useRoute, routes } = createRouter({
    home: defineRoute("/"),
    counter: defineRoute({ id: param.path.string }, params => `/counter/${params.id}`),
});
