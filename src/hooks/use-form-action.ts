'use client';

import { useRef, useState, useTransition } from 'react';

type ActionValue = string | number | boolean | Date | null;

type ActionArguments = {
    [key: string]: ActionValue | ActionValue[];
};

type ActionErrors<T> = {
    [key in keyof T]?: string | boolean;
};

type ActionResult<T> = {
    errors: ActionErrors<T>
} | {};

export default function useFormAction<T extends ActionArguments, R extends ActionResult<T>>({ initial, action, then }: {
    initial: T;
    action: (args: T) => Promise<R>;
    then?: (data: R) => Promise<void> | void;
}) {
    const internal = useRef(initial);
    const [values, setState] = useState(initial);
    const [errors, setErrors] = useState<ActionErrors<T>>({});
    const [pending, start] = useTransition();

    async function formAction() {
        // @ts-expect-error
        start(async () => {
            const result = await action(internal.current);
            
            setErrors('errors' in result ? result.errors : {});
            then?.(result);
        });
    }

    function setValues(values: Partial<T>) {
        Object.assign(internal.current, values);
        setState(Object.assign({}, internal.current));
    }

    function bind<K extends keyof T, A extends any>(key: K, onChange?: (arg: A) => T[K]) {
        const value = values[key];
        const isBool = typeof value === 'boolean';

        return {
            onChange: (arg: A) => {
                let updated = value;

                if (onChange !== undefined) {
                    updated = onChange(arg);
                } else
                if (arg && typeof arg === 'object' && 'target' in arg && arg.target instanceof Element) {
                    updated = isBool ? (arg.target as any).checked : (arg.target as any).value;
                }

                setValues({ [key]: updated } as any);
            },
            value: isBool ? undefined : value,
            checked: isBool ? value : undefined,
            error: errors[key]
        };
    }

    return {
        formAction,
        pending,
        bind
    };
}