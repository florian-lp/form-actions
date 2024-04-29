import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import del from 'rollup-plugin-delete';
import typescript from '@rollup/plugin-typescript';
import preserveDirectives from 'rollup-plugin-preserve-directives';

const production = process.env.NODE_ENV === 'production';

export default {
    input: ['src/index.ts'],
    external: ['react', 'react-dom', 'react/jsx-runtime', 'tslib'],
    output: {
        dir: 'dist',
        format: 'es',
        sourcemap: true,
        preserveModules: true,
        preserveModulesRoot: 'src'
    },
    plugins: [
        production ? del({ targets: 'dist/**' }) : undefined,
        resolve(),
        commonjs(),
        typescript({
            tsconfig: './tsconfig.json'
        }),
        preserveDirectives(),
        production ? terser({ compress: { directives: false } }) : undefined,
    ],
    onwarn: (msg, handler) => {
        if (msg.code === 'MODULE_LEVEL_DIRECTIVE') return;

        handler(msg);
    }
}