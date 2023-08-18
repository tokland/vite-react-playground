import { getId, Ref } from "./Base";
import { Counter } from "./Counter";
import { IndexedSet } from "./generic/IndexedSet";

export class Counters {
    constructor(private set: IndexedSet<Counter, Ref>) {}

    static empty(): Counters {
        const set = IndexedSet.fromArray<Counter, Ref>([], getId);
        return new Counters(set);
    }

    get(ref: Ref): Counter | undefined {
        return this.set.get(ref);
    }

    update(counter: Counter): Counters {
        return new Counters(this.set.update(counter));
    }
}
