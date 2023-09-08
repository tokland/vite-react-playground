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

## Clean architecture

-   Domain layer: Entities, Use Cases, Repositories (interfaces).
-   Data layer: Repositories (implementations).
-   Presentation layer: Web App, CLI scripts.
-   CompositionRoot: glue data repositories with domain use cases.

## Auto-generated mock testing

### Introduction

Clean Architecture promotes Dependency Injection, so it's easy to isolate a System Under Test (SUT) from its external dependencies. Two strategies are typically employed:

1. Stubs: Fake implementations of the dependencies. Cons: a lot of boilerplate; stubs must be created manually and kept up-to-date to changes of the SUT or the dependencies. Also, coding realistic stateful stubs is not trivial, and they may introduce bugs of their own.

2. Mocks: Instead of writing real implementations of the depedencies, we just define which calls (arguments + result) are expected. It's usually more convenient than writing static stubs, but still tedious to keep them up-to-date with the implementation.

## Proposed solution

Auto-generated snapshots mocks. On development -and only on creation or on update when requested- snapshots are created by performing real calls to the external systems. The snapshots save the details of the calls (function + arguments + return value).

### Implementation

-   [ES6 proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) to intercept calls.

-   [File Snaphots](https://vitest.dev/api/expect.html#tomatchfilesnapshot), integrated with the snapshot infrastructure of the testing library.

-   The object to proxy can be arbitrarily nested (only methods/functions are proxied).

-   The order of calls is relevant: a snapshot is valid only if the SUT calls all the entries (same function/arguments) in the exact same order.

-   Rollback functions (setup/teardown) are executed only when the snapshots are being updated.

-   Snapshots are stored as fully-typed TS files, so changes in the types of dependencies will be readily detected.

-   No need to manually call a expect method at the of the test. The expectation is automatically run after the test run.

### Infrastructure

We need the ability to _compare_ and _serialize_ arguments and return values used in the snapshots. As Javascript does not provide this infrastructure out-of-the box, we must define these serializers manually. Serializers for the most common JS data structure are provided, so we'll only have to write them for custom classes of our application. An example:

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

const positionSerializer = serializer<Position>()({
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

To write tests, we will need fixtures, testing data of our entities. On complex apps, as it happens with mocks and stubs, manually creating and keeping fixtures up-to-date is time-consuming.

The serialization infrastructure to just created for the mocks can be re-used. We create fixtures by calling to the dependeencies (typically, repositories) and store the result as TS files.

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
        id1: modules.Counter.create({ id: "1", value: 1 }),
        id2: modules.Counter.create({ id: "2", value: 2 }),
    },
};
```
