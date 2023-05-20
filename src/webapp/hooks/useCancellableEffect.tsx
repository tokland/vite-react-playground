import React from "react";

type Cancel = () => void;

export function useCancellableEffect<Args extends any[]>(
    runEffect: (...args: Args) => Cancel,
): [(...args: Args) => void, Cancel] {
    const [args, setArgs] = React.useState<Args>();
    const run = React.useCallback((...args: Args) => setArgs(args), [setArgs]);
    const cancel = React.useCallback(() => setArgs(undefined), [setArgs]);

    React.useEffect(() => {
        return args ? runEffect(...args) : undefined;
    }, [args, runEffect]);

    return [run, cancel];
}
