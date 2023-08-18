import { CounterBrowserStorageRepository } from "./data/CounterBrowserStorageRepository";
import {
    BrowserKeyValueStorage,
    InMemoryKeyValueStorage,
    KeyValueStorage,
} from "./data/KeyValueStorage";
import { GetCounterUseCase } from "./domain/usecases/GetCounterUseCase";
import { SaveCounterUseCase } from "./domain/usecases/SaveCounterUseCase";

export function getCompositionRoot(repositories: Repositories) {
    return {
        counters: {
            get: new GetCounterUseCase(repositories.counter),
            save: new SaveCounterUseCase(repositories.counter),
        },
    };
}

export function getAppCompositionRoot() {
    const repositories = getAppRepositories();
    return getCompositionRoot(repositories);
}

export function getRepositories(services: Services) {
    return {
        counter: new CounterBrowserStorageRepository(services.storage),
    };
}

export function getAppRepositories() {
    const services = getServices();
    return getRepositories(services);
}

export function getServices() {
    return {
        storage: (typeof localStorage !== "undefined"
            ? new BrowserKeyValueStorage()
            : new InMemoryKeyValueStorage()) as KeyValueStorage,
    };
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;

export type Repositories = ReturnType<typeof getRepositories>;

export type Services = ReturnType<typeof getServices>;
