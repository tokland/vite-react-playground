import { Id } from "./Base";
import { Counter } from "./Counter";
import { HashMap } from "./generic/HashMap";

export class Counters {
    constructor(private map: HashMap<Id, Counter>) {}

    static empty(): Counters {
        return new Counters(HashMap.empty());
    }

    getById(id: Id): Counter | undefined {
        return this.map.get(id);
    }

    update(counter: Counter): Counters {
        return new Counters(this.map.set(counter.id, counter));
    }
}
