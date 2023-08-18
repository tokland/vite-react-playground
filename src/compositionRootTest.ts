import {
    CompositionRoot,
    Repositories,
    Services,
    getCompositionRoot,
    getAppCompositionRoot,
    getRepositories,
    getAppRepositories,
    getServices,
} from "./compositionRoot";
import { getProxy } from "./tests/AppProxySnapshots";

export type { CompositionRoot, Repositories, Services };

export function getProxiedRepositories() {
    const repositories = getAppRepositories();
    return getProxy(repositories, { type: { name: "Repositories", path: __filename } });
}

export async function getRepositoriesWithProxiedServices() {
    const services = getServices();
    const proxiedServices = await getProxy(services, {
        type: { name: "Services", path: __filename },
    });
    return getRepositories(proxiedServices);
}

export async function getCompositionRootWithProxiedRepos() {
    const proxiedRepositories = await getProxiedRepositories();
    return getCompositionRoot(proxiedRepositories);
}

export async function getProxiedCompositionRoot(): Promise<CompositionRoot> {
    const compositionRoot = getAppCompositionRoot();
    return getProxy(compositionRoot, { type: { name: "CompositionRoot", path: __filename } });
}
