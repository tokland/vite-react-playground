## Description

Playground and best practices for React SPA with Typescript.

## Setup

```
$ nvm use
$ yarn install
$ yarn start
```

## Build

```
$ yarn generate-docs
$ yarn check-code-quality
$ yarn build
```

## Libraries

-   Development tooling: template generator, development server, production builds, unit testing: [vite](https://vitejs.dev/)
-   Type safe routing: [type-route](https://github.com/zilch/type-route) (router.ts, Router.tsx)
-   Lightweight state management: [zustand](https://github.com/pmndrs/zustand) (GenericStore.ts, AppStore.ts)
-   Cancelable promises: [real-cancellable-promise](https://github.com/srmagura/real-cancellable-promise) (Async.ts).
-   Type safe command-line argument parser: [cmd-ts](https://cmd-ts.vercel.app/) (scripts/example.ts)
-   Immutable data structures: [rimbu](https://rimbu.org/) (Collection.ts, HashMap.ts, IndexedSet.ts)
-   Documentation: [typedoc](https://typedoc.org/).
-   Code linting: [eslint](https://eslint.org/) and [ts-prune](https://github.com/nadeesha/ts-prune).
-   Unit testing: [vitest](https://vitest.dev/)
-   End-to-end testing: [playwright](https://playwright.dev/) (src/tests/playwright)

## Clean architecture

-   Domain layer: entities, use cases, repository interfaces.
-   Data layer: Repository implementations.
-   Presentation layer: React views.
