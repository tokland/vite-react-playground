import { isElementOfUnion, UnionFromArray } from "./ts-utils";

type LogLevel = UnionFromArray<typeof logLevels>;

const logLevels = ["debug", "info", "warn", "error"] as const;
const isNode = typeof process !== "undefined";
const levelFromEnv = isNode ? process.env["LOG_LEVEL"] : localStorage.getItem("LOG_LEVEL");
const level = levelFromEnv && isElementOfUnion(levelFromEnv, logLevels) ? levelFromEnv : "info";
const levelIndex = logLevels.indexOf(level);

function getLogger(logLevelIndex: number, level: LogLevel) {
    return function writer(message: string) {
        if (logLevelIndex >= levelIndex) {
            const ts = new Date().toISOString();
            process.stderr.write(`[${level.toUpperCase()} ${ts}] ${message}\n`);
        }
    };
}

const logger = {
    debug: getLogger(0, "debug"),
    info: getLogger(1, "info"),
    warn: getLogger(2, "warn"),
    error: getLogger(3, "error"),
};

export default logger;
