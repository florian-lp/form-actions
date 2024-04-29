# Form actions

[![NPM package](https://img.shields.io/npm/v/form-actions)](https://www.npmjs.com/package/form-actions)
[![NPM bundle size](https://img.shields.io/bundlephobia/minzip/form-actions)](https://bundlephobia.com/package/form-actions)
[![Last commit](https://img.shields.io/github/last-commit/florian-lp/form-actions)](https://github.com/florian-lp/form-actions)
![NPM weekly downloads](https://img.shields.io/npm/dw/form-actions)
![NPM downloads](https://img.shields.io/npm/dt/form-actions)

Type-safe form submissions using React server actions.

# Usage

```tsx
'use client';

import { useFormAction } from 'form-actions';
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