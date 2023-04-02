import { createRouter, defineRoute, param } from "type-route";

export const { RouteProvider, useRoute, routes } = createRouter({
    home: defineRoute("/"),
    counter: defineRoute({ id: param.path.string }, p => `/counter/${p.id}`),
});
