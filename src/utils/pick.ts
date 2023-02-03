type AllKeys<T> = T extends unknown ? keyof T : never;

export function pick<O, K extends AllKeys<O>>(
    base: O,
    keys: readonly K[]
): Pick<O, K> {
    const entries = keys.map((key) => [key, base?.[key]]);
    return Object.fromEntries(entries);
}
