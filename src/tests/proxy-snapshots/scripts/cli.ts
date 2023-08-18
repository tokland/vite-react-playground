import { Builders } from "../domain/Builders";
import { Fixtures, Import } from "../domain/entities";
import { GenerateFixturesUseCase } from "../domain/usecases/GenerateFixturesUseCase";
import { FixturesTsFileRepository } from "../data/FixturesTsFileRepository";

export async function cli(options: {
    builders: Builders;
    filePath: string;
    getFixtures: () => Promise<Fixtures>;
    modulesRef: Import;
}) {
    const { getFixtures } = options;
    const [command] = process.argv.slice(2);
    const fixtureRepository = new FixturesTsFileRepository();

    switch (command) {
        case "generate": {
            return new GenerateFixturesUseCase({ fixtureRepository }).execute({
                ...options,
                fixtures: await getFixtures(),
            });
        }
        default:
            throw new Error(`Unknown command: ${command}`);
    }
}
