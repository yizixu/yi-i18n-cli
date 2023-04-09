// import babel from '@rollup/plugin-babel'
// import resolve from '@rollup/plugin-node-resolve'
// import commonjs from '@rollup/plugin-commonjs'
// import terser from '@rollup/plugin-terser'
// import json from '@rollup/plugin-json'
import del from 'rollup-plugin-delete'

export default {
  input: './cli/index.js',
  output: [
    {
      file: './bin/index.cjs.js',
      format: 'cjs'
    },
    {
      file: './bin/index.es.js',
      format: 'es'
    },
    {
      file: './bin/index.amd.js',
      format: 'amd'
    },
    {
      file: './bin/index.umd.js',
      format: 'umd'
    }
  ],
  plugins: [
    del({ targets: 'bin/*' })
    // resolve(),
    // json(),
    // commonjs(),
    // babel({ babelHelpers: 'bundled', exclude: 'node_modules/**' }),
    // 压缩代码
    // terser()
  ]
}
