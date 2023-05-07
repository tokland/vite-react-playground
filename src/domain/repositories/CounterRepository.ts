import { Counter } from "../entities/Counter";
import { Async } from "../entities/generic/Async";

export interface CounterRepository {
    get(id: string): Async<Counter>;
    save(counter: Counter): Async<Counter>;
}
