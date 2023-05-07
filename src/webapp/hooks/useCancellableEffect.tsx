import React from "react";

type Cancel = () => void;

export function useCancellableEffect<Args extends any[]>(
    runEffect: (...args: Args) => Cancel,
    options: { cancelOnComponentUnmount?: boolean } = {},
): [(...args: Args) => void, Cancel] {
    const { cancelOnComponentUnmount = false } = options;
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

        return cancelOnComponentUnmount ? cancelEffect : undefined;
    }, [args, runEffect, cancelOnComponentUnmount, clearArgs]);

    const run = React.useCallback((...args: Args) => setArgs(args), [setArgs]);
    const cancel = cancelRef.current;

    return [run, cancel];
}
