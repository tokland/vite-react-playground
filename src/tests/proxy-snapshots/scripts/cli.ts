import { Fixtures } from "../domain/entities";
import { GenerateFixturesUseCase } from "../domain/usecases/GenerateFixturesUseCase";
import { FixturesRepository } from "../domain/repositories";

export async function cli(options: {
    filePath: string;
    getFixtures: () => Promise<Fixtures>;
    fixturesRepository: FixturesRepository;
}) {
    const { getFixtures } = options;
    const [command] = process.argv.slice(2);

    switch (command) {
        case "generate-fixtures": {
            return new GenerateFixturesUseCase(options).execute({
                ...options,
                fixtures: await getFixtures(),
            });
        }
        default:
            throw new Error(`Unknown command: ${command}`);
    }
}
