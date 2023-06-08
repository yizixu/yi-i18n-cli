// import { babel } from '@rollup/plugin-babel'
// import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
// import json from '@rollup/plugin-json'
import del from 'rollup-plugin-delete'

export default {
  input: './cli/index.js',
  output: [
    {
      file: './bin/index.cjs.js',
      format: 'cjs',
      banner: '#!/usr/bin/env node'
    },
    {
      file: './bin/index.es.js',
      format: 'es',
      banner: '#!/usr/bin/env node'
    },
    {
      file: './bin/index.amd.js',
      format: 'amd',
      banner: '#!/usr/bin/env node'
    },
    {
      file: './bin/index.umd.js',
      format: 'umd',
      banner: '#!/usr/bin/env node'
    }
  ],
  plugins: [
    del({ targets: 'bin/*' }),
    commonjs(),
    // resolve(),
    // json()
    // babel({ babelHelpers: 'bundled', exclude: 'node_modules/**' }),
    terser()
  ]
}
