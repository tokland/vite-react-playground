import { Fixtures } from "../entities";
import { FixturesRepository } from "../repositories";

type GenerateFixturesUseCaseOptions = {
    filePath: string;
    fixtures: Fixtures;
};

export class GenerateFixturesUseCase {
    constructor(private repositories: { fixturesRepository: FixturesRepository }) {}

    execute(options: GenerateFixturesUseCaseOptions) {
        this.repositories.fixturesRepository.generate(options);
    }
}
