import { call } from "../../../../tests/proxy-snapshots/data/SnapshotTsFileRepository";
import { Repositories } from "../../../../compositionRootTest";
import { modules as _modules } from "../../../../tests/AppProxySnapshots";

export default function get() {
    return [
        call<Repositories>()({
            fn: obj => obj.counter.get,
            args: ["id1"],
            returns: _modules.Async.success(_modules.Counter.create({ id: "id1", value: 0 })),
        }),
    ];
}
