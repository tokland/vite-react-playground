import { Builders } from "../Builders";
import { Fixtures, Import } from "../entities";
import { FixturesRepository } from "../repositories";

type GenerateFixturesUseCaseOptions = {
    filePath: string;
    builders: Builders;
    fixtures: Fixtures;
    modulesRef: Import;
};

export class GenerateFixturesUseCase {
    constructor(private repositories: { fixtureRepository: FixturesRepository }) {}

    execute(options: GenerateFixturesUseCaseOptions) {
        this.repositories.fixtureRepository.save(options);
    }
}
