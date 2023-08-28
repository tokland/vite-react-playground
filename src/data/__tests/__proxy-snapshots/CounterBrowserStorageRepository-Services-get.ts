import { call } from "../../../tests/proxy-snapshots/data/SnapshotTsFileRepository";
import { Services } from "../../../compositionRootTest";
import { modules as _modules } from "../../../tests/AppProxySnapshots";

export default function get() {
    return [
        call<Services>()({
            fn: obj => obj.storage.get,
            args: ["counter-id1"],
            returns: undefined,
        }),
    ];
}
