import { Counter } from "../domain/entities/Counter";
import { Async } from "../domain/entities/generic/Async";
import { CounterRepository } from "../domain/repositories/CounterRepository";
import logger from "../domain/utils/log";
import { KeyValueStorage } from "./KeyValueStorage";

export class CounterBrowserStorageRepository implements CounterRepository {
    constructor(private storage: KeyValueStorage) {}

    get(id: string): Async<Counter> {
        return Async.block(async $ => {
            // console.log(await $(getJSON("https://jsonplaceholder.typicode.com/todos/1")));
            const key = this.getKey(id);
            const value = this.storage.get<number>(key);
            const counter: Counter = new Counter({ id, value: value ?? 0 });
            await $(Async.sleep(500));
            return counter;
        });
    }

    save(counter: Counter): Async<void> {
        return Async.block(async $ => {
            const key = this.getKey(counter.id);
            await $(Async.sleep(500));
            logger.debug(`Set: ${key}=${counter.value}`);
            this.storage.set(key, counter.value);
        });
    }

    private getKey(id: string): string {
        return `counter-${id}`;
    }
}

function _getJSON<U>(url: string): Async<U> {
    const abortController = new AbortController();

    return Async.fromComputation((resolve, reject) => {
        fetch(url, { method: "get", signal: abortController.signal })
            .then(res => res.json() as U)
            .then(resolve)
            .catch(reject);

        return () => abortController.abort();
    });
}
