import React from "react";

export type Element = JSX.Element;

export function buildStyles<T extends Record<string, React.CSSProperties>>(styles: T): T {
    return styles;
}

export function component<Props>(comp: (props: Props) => Element) {
    return React.memo(comp);
}
