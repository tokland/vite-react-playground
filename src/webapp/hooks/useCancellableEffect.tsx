import React from "react";

type Cancel = () => void;

export function useCancellableEffect<Args extends any[]>(
    runEffect: (...args: Args) => Cancel,
): [(...args: Args) => void, Cancel] {
    const [args, setArgs] = React.useState<Args>();
    const clearArgs = React.useCallback(() => setArgs(undefined), [setArgs]);
    const cancelRef = React.useRef<Cancel>(() => clearArgs());

    React.useEffect(() => {
        if (!args) return;

        const cancelEffect = runEffect(...args);

        cancelRef.current = () => {
            clearArgs();
            cancelEffect();
        };

        return cancelEffect;
    }, [args, runEffect, clearArgs]);

    const run = React.useCallback((...args: Args) => setArgs(args), [setArgs]);
    const cancel = cancelRef.current;

    return [run, cancel];
}
