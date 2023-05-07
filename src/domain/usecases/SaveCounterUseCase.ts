import { Counter } from "../entities/Counter";
import { Async } from "../entities/generic/Async";
import { CounterRepository } from "../repositories/CounterRepository";

export class SaveCounterUseCase {
    constructor(private counterRepository: CounterRepository) {}

    execute(counter: Counter): Async<Counter> {
        return this.counterRepository.save(counter);
    }
}
