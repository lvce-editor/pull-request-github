import pluginTypeScript from '@babel/preset-typescript'
import { babel } from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { join } from 'path'
import { rollup, type RollupOptions } from 'rollup'
import { root } from './root.ts'

const getOptions = (outputFile: string): RollupOptions => {
  return {
    input: join(root, 'packages/pull-requests-github/src/pullRequestWorkerMain.ts'),
    preserveEntrySignatures: 'strict',
    treeshake: {
      propertyReadSideEffects: false,
    },
    output: {
      file: outputFile,
      format: 'es',
      freeze: false,
      generatedCode: {
        constBindings: true,
        objectShorthand: true,
      },
    },
    external: ['ws', 'electron'],
    plugins: [
      babel({
        babelHelpers: 'bundled',
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        presets: [pluginTypeScript],
      }),
      nodeResolve(),
    ],
  }
}

export const bundleJs = async (outputFile = join(root, '.tmp/dist/dist/pullRequestWorkerMain.js')): Promise<void> => {
  const options = getOptions(outputFile)
  const input = await rollup(options)
  await input.write(options.output as any)
}
