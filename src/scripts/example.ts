import { command, run, string, number, positional, option } from "cmd-ts";

const cmd = command({
    name: "my-command",
    description: "print something to the screen",
    version: "1.0.0",
    args: {
        message: option({ long: "greeting", type: string }),
        number: positional({ type: number, displayName: "num" }),
    },
    handler: args => {
        console.debug(args.message, args.number);
    },
});

run(cmd, process.argv.slice(2));

export {};
