import { Id } from "./Base";
import { Struct } from "./generic/Struct";

export class Counter extends Struct<{ id: Id; value: number }>() {
    add(value: number): Counter {
        return this._update({ value: this.value + value });
    }
}
