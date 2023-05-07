import { Counter } from "../domain/entities/Counter";
import { Async } from "../domain/entities/generic/Async";
import { CounterRepository } from "../domain/repositories/CounterRepository";

export class CounterBrowserStorageRepository implements CounterRepository {
    get(id: string): Async<Counter> {
        const key = this.getKey(id);
        const value = window.localStorage.getItem(key);
        const counter: Counter = new Counter({ id, value: value ? parseInt(value) : 0 });
        return Async.sleep(1000).map(() => counter);
    }

    save(counter: Counter): Async<Counter> {
        return Async.block(async $ => {
            const key = this.getKey(counter.id);
            const value = counter.value.toString();
            await $(Async.sleep(1000));
            console.debug("localStore.setItem", key, "=", value);
            window.localStorage.setItem(key, value);
            return counter;
        });
    }

    private getKey(id: string): string {
        return `counter-${id}`;
    }
}
