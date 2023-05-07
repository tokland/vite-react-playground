import { CounterBrowserStorageRepository } from "./data/CounterBrowserStorageRepository";
import { GetCounterUseCase } from "./domain/usecases/GetCounterUseCase";
import { SaveCounterUseCase } from "./domain/usecases/SaveCounterUseCase";

export function getCompositionRoot() {
    const countersRepository = new CounterBrowserStorageRepository();

    return {
        counters: {
            get: new GetCounterUseCase(countersRepository),
            save: new SaveCounterUseCase(countersRepository),
        },
    };
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;
