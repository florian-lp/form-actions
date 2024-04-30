import { isDate } from "./shared";

/**
 * Parses a JSON `string` into an `object`.
 * 
 * Includes support for parsing ISO formatted dates into `Date` objects.
 */
export default function parseJson(str: string) {
    return JSON.parse(str, (_, value) => {
        if (typeof value === 'string' && isDate(value)) return new Date(value);

        return value;
    });
}