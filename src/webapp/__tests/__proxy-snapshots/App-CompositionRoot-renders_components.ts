import { call } from "../../../tests/proxy-snapshots/data/SnapshotTsFileRepository";
import { CompositionRoot } from "../../../compositionRootTest";
import { modules as _modules } from "../../../tests/AppProxySnapshots";

export default function get() {
    return [
        call<CompositionRoot>()({
            fn: obj => obj.counters.get.execute,
            args: ["1"],
            returns: _modules.Async.success(_modules.Counter.create({ id: "1", value: 0 })),
        }),
        call<CompositionRoot>()({
            fn: obj => obj.counters.save.execute,
            args: [_modules.Counter.create({ id: "1", value: 1 })],
            returns: _modules.Async.success(undefined),
        }),
        call<CompositionRoot>()({
            fn: obj => obj.counters.save.execute,
            args: [_modules.Counter.create({ id: "1", value: 2 })],
            returns: _modules.Async.success(undefined),
        }),
    ];
}
