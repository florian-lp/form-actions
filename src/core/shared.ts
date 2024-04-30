type SerializableValue = string | number | boolean | Date | null;

export type SerializableArguments = {
    [key: string]: SerializableValue | SerializableValue[] | SerializableArguments | SerializableArguments[];
};

export type ActionErrors<T> = {
    [key in keyof T]?: string | boolean;
};

export type ActionResult<T> = {
    errors: ActionErrors<T>;
} | {};

export const isBoolean = (str: string) => /^(true|false)$/.test(str);

export const isNumber = (str: string) => /^[+-]?\d*\.?\d+([Ee][+-]?\d+)?$/.test(str);

export const isDate = (str: string) => /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/.test(str);