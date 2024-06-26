# Form actions

[![NPM package](https://img.shields.io/npm/v/form-actions)](https://www.npmjs.com/package/form-actions)
[![NPM bundle size](https://img.shields.io/bundlephobia/minzip/form-actions)](https://bundlephobia.com/package/form-actions)
[![Last commit](https://img.shields.io/github/last-commit/florian-lp/form-actions)](https://github.com/florian-lp/form-actions)
![NPM weekly downloads](https://img.shields.io/npm/dw/form-actions)
![NPM downloads](https://img.shields.io/npm/dt/form-actions)

Type-safe form submissions using React server actions.

## Usage

```tsx
// my-form.tsx
'use client';

import { useFormAction } from 'form-actions/hooks';
import { myAction } from './actions';

export default function myForm() {
    const { formAction, pending, bind, reset } = useFormAction({
        initial: {
            email: '',
            password: ''
        },
        action: myAction,
        then(data) {
            if (data.errors) console.log(data.errors);

            reset();
        }
    });

    return <form action={formAction}>
        <input placeholder="Email" required {...bind('email')}>
        <input placeholder="Password" required {...bind('password')}>

        <button disabled={pending}>Sign in</button>
    </form>;
}
```

```ts
// actions.ts
'use server';

export async function myAction({ email, password }: {
    email: string;
    password: string;
}) {
    const user = getUserFromEmail(email);
    
    if (!user) return {
        errors: {
            email: 'Email is incorrect'
        }
    };

    if (!compare(password, user.hash)) return {
        errors: {
            password: 'Password is incorrect'
        }
    };

    return { user };
}
```

## With server-side validation

```ts
// actions.ts
'use server';

import { z } from 'zod';

const schema = z.object({
    email: z.string(),
    password: z.string()
});

export async function myAction(data: { email: string; password: string; }) {
    const { error } = schema.safeParse(data);
    
    if (error) return {
        errors: {
            email: true,
            password: true
        }
    };

    const user = getUserFromEmail(email);

    if (!user) return {
        errors: {
            email: 'Email is incorrect'
        }
    };

    if (!compare(password, user.hash)) return {
        errors: {
            password: 'Password is incorrect'
        }
    };

    return { user };
}
```

## Create a public REST endpoint

Using `createEndpointFromAction` you are able to create a wrapper around an action that takes in a `Request` object and returns a `Response` object with a `JSON` payload containing the return data from the action.

This could, for example, be used with Next.js' route handler files to create a publicly accessible endpoint.
```ts
// route.ts

import { createEndpointFromAction } from 'form-actions';
import { myAction } from './actions';

export const POST = createEndpointFromAction(myAction);
```