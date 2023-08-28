## Description

Explore best practices for React applications.

## Setup

```
$ nvm use
$ yarn install
$ yarn start
```

## Build

```
$ yarn build
```

## Notes

-   Development tooling: development server, production builds, unit testing: [vite](https://vitejs.dev/)
-   Type safe routing: [type-route](https://github.com/zilch/type-route) (router.ts, Router.tsx)
-   Lightweight state management: [zustand](https://github.com/pmndrs/zustand) (GenericStore.ts, AppStore.ts)
-   Cancelable promises: [real-cancellable-promise](https://github.com/srmagura/real-cancellable-promise) (src/domain/entities/generic/Async.ts).
-   Type safe command-line argument parser: [cmd-ts](https://cmd-ts.vercel.app/) (scripts/example.ts)
-   Immutable data structures: Collection.ts, HashMap.ts, IndexedSet.ts
-   Documentation: [typedoc](https://typedoc.org).
-   Code linting: [eslint](https://eslint.org) and [ts-prune](https://github.com/nadeesha/ts-prune).
-   Unit testing: [vitest](https://vitest.dev)
-   End-to-end testing: [playwright](https://playwright.dev) (src/tests/playwright)
-   Code-Splitting: Use React.lazy + React.suspense (src/webapp/Router.tsx)

## Clean architecture

-   Domain layer: Entities, Use Cases, Repositories (interfaces).
-   Data layer: Repositories (implementations).
-   Presentation layer: Web App, CLI scripts.
-   CompositionRoot: glue data repositories with domain use cases.

## Auto-generated mock testing

### Introduction

Clean Architecture promotes Dependency Injection, which allows to easily isolate a System Under Test (SUT) from its external dependencies. Two strategies are typically employed:

1. Stubs: Write fake implementations of the dependencies. Cons: lots of boilerplate; they must be created manually and kept up-to-date to changes of the SUT or the dependencies. Also, coding stateful stubs are not trivial, and they may introduce bugs of their own.

2. Mocks: Instead of writing real implementations, we pass around facade objects that just define which calls (arguments + result) are expected. It's usually more convenient than writing static stubs, but still tedious to keep them up-to-date with the implementation.

## Proposed solution

Auto-generated mocks using file snapshots. On development -and only on creation and update when requested- snapshots are created by making real calls to the external systems. These snapshots contain all the details of the calls (function + arguments + return value).

### Implementation

-   It uses [ES6 proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) to intercept calls.

-   It uses [File Snaphots](https://vitest.dev/api/expect.html#tomatchfilesnapshot), integrated with the snapshot infrastructure of the testing library.

-   The object to proxy can be arbitrarily nested (only methods/functions are proxied).

-   Order of calls is relevant: a snapshot is valid only if the SUT calls all the entries (same function/arguments) in the exact same order.

-   Rollback functions (setup/teardown) are executed only when the snapshots are being updated.

-   Snapshots are stored as fully-typed TS files, so breaking changes in the dependencies is easily detectable.

-   The expectation is automatically run after the test run (on teardown).

-   We use TS-code serialization to build the snapshots files.

### Infrastructure

We need the ability to _compare_ and _serialize_ any value used in the snapshot (both arguments and return values). As Javascript does not provide this infrastructure out-of-the box, we must define these serializers manually. Serializers for the most common JS data structure are provided, so we'll only have to write them for custom classes of our application. A serializer for a position class type might look like this:

```typescript
// Entity
class Position {
    constructor(public x: number, public y: number);

    add(x: number, y: number) {
        return new Position(this.x + x, this.y + y);
    }
}

// Serializer
import { Position } from "./domain/entities";

const posSerializer = serializer<Position>()({
    hasType: obj => !!obj && obj.constructor === Pos,
    isEqual: (pos1, pos2) => pos1.x === pos1.y && pos2.y === pos2.y,
    modules: { Position },
    toTs: (pos, serializer) => `new ${serializer.modulesRef}.Position(${pos.x}, ${pos.y})`,
});
```

### Example

```typescript
export { Repositories } from "../../data/repositories";

test("GetAlbumsUseCase", () => {
    const proxiedRepositories = getSnapshotProxy(repositories, {
        type: { name: "Repositories", path: __filename },
    });

    const albums = await new GetAlbumsUseCase(proxiedRepositories).execute();
    expect(albums.length).toEqual(3);
});
```

### Bonus: Test fixtures

To write tests, we well need fixtures, testing data of our entities. On complex apps, manually creating and keeping this data up-to-date is time-consuming.

Let's reuse the serialization infrastructure to create fixtures by calling the external systems (typically, repositories) and storing the result as TS files.

```typescript
async function getFixtures() {
    const repositories = getAppRepositories();

    return {
        counter: {
            id1: await repositories.counter.get("1").toPromise(),
            id2: await repositories.counter.get("2").toPromise(),
        },
    };
}
```

Generates:

```typescript
const fixtures = {
    counter: {
        id1: _modules.Counter.create({ id: "1", value: 0 }),
        id2: _modules.Counter.create({ id: "2", value: 0 }),
    },
};
```
