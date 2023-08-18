export type Maybe<T> = T | undefined;

// ts-prune-ignore-next
export type Expand<T> = {} & { [P in keyof T]: T[P] };

export type UnionFromArray<T extends ReadonlyArray<unknown>> = T[number];

export function assert<T>(value: T | undefined): T {
    if (value === undefined) throw new Error("Assert error");
    return value;
}

export function isElementOfUnion<Union extends string>(
    value: string,
    values: readonly Union[],
): value is Union {
    return (values as readonly string[]).includes(value);
}

// ts-prune-ignore-next
export function assertUnreachable(
    value: never,
    message = `No such case in exhaustive switch: ${value}`,
) {
    throw new Error(message);
}

// ts-prune-ignore-next
export type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends (infer U)[]
        ? RecursivePartial<U>[]
        : T[P] extends object
        ? RecursivePartial<T[P]>
        : T[P];
};
