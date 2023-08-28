import { modules as _modules } from "./AppProxySnapshots";

const fixtures = {
    counter: {
        id1: _modules.Counter.create({ id: "1", value: 0 }),
        id2: _modules.Counter.create({ id: "2", value: 0 }),
    },
};

export default fixtures;
