type AfterThisCallback = (() => unknown) | (() => Promise<unknown>);

export function afterThis(fn: AfterThisCallback) {
    if (!expect.getState().currentTestName) {
        throw new Error("You can only use afterThis inside a test");
    }

    pendingAfterThis.callbackStack.push(fn);
}

const pendingAfterThis = {
    callbackStack: [] as AfterThisCallback[],
    cleanCallbackStack() {
        this.callbackStack = [];
    },
};

async function handlePendingAfterThis() {
    const reverseCallbacks = [...pendingAfterThis.callbackStack].reverse();
    pendingAfterThis.cleanCallbackStack();

    for (const cb of reverseCallbacks) {
        await cb();
    }
}

if (typeof afterEach !== "undefined") {
    afterEach(handlePendingAfterThis);
}
