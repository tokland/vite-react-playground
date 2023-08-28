import { call } from "../../../../tests/proxy-snapshots/data/SnapshotTsFileRepository";
import { Repositories } from "../../../../compositionRootTest";
import { modules as _modules } from "../../../../tests/AppProxySnapshots";

export default function get() {
    return [
        call<Repositories>()({
            fn: obj => obj.counter.save,
            args: [_modules.Counter.create({ id: "1", value: 0 })],
            returns: _modules.Async.success(undefined),
        }),
    ];
}
