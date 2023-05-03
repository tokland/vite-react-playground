import { Struct } from "./Generic/Struct";

export class Counter extends Struct<{ id: string; value: number }>() {
    /**
     *  Integer counter
     */
    add(value: number): Counter {
        return this._update({ value: this.value + value });
    }
}
