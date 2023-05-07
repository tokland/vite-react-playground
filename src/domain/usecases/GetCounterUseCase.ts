import { Counter } from "../entities/Counter";
import { Async } from "../entities/generic/Async";
import { CounterRepository } from "../repositories/CounterRepository";

export class GetCounterUseCase {
    constructor(private counterRepository: CounterRepository) {}

    execute(id: string): Async<Counter> {
        return this.counterRepository.get(id);
    }
}
