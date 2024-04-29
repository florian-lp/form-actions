import { useRef, useState, useTransition } from 'react';

type ActionValue = string | number | boolean | Date | null;

type ActionArguments = {
    [key: string]: ActionValue | ActionValue[];
};

type ActionErrors<T> = {
    [key in keyof T]?: string | boolean;
};

type ActionResult<T> = {
    errors: ActionErrors<T>;
} | {};

export default function useFormAction<T extends ActionArguments, R extends ActionResult<T>>({ initial, action, then }: {
    /**
     * An object representing the initial values for the form.
     */
    initial: T;
    /**
     * A server action `function` annotated with a `'use server'` directive.
     */
    action: (args: T) => Promise<R>;
    /**
     * Gets called after the `action()` completes and gets passed it's awaited return value.
     */
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
        /**
         * The action to be passed to a `<form />` element's `action` attribute.
         * 
         * `<form action={formAction} />`
         */
        formAction,
        /**
         * Whether the form is currently being submitted or not.
         * 
         * Can be used to disable the form whilst it's being submitted.
         */
        pending,
        /**
         * Bind an input to the form by passing the `value`, `checked` and `onChange` props to it.
         * 
         * Accepts an optional argument which can be used to map a custom components `onChange` argument to a value accepted by the form.
         * 
         * When not provided, it defaults to using `event.target.value` or `event.target.checked`.
         * 
         * `<input {...bind('myField')} />`
         */
        bind,
        /**
         * Resets the form to the values defined in the `initial` argument.
         */
        reset: setValues.bind(initial)
    };
}