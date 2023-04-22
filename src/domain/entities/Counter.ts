import { Struct } from "./Generic/Struct";

export class Counter extends Struct<{ id: string; value: number }>() {
    add(value: number): Counter {
        return this._update({ value: this.value + value });
    }
}
