import pluginTypeScript from '@babel/preset-typescript'
import { babel } from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { join } from 'path'
import { rollup, type RollupOptions } from 'rollup'
import { root } from './root.ts'

const getOptions = (inputFile: string, outputFile: string): RollupOptions => {
  return {
    input: inputFile,
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

const bundleEntryPoint = async (inputFile: string, outputFile: string): Promise<void> => {
  const options = getOptions(inputFile, outputFile)
  const input = await rollup(options)
  await input.write(options.output as any)
}

export const bundleJs = async (outDir = join(root, '.tmp/dist/dist')): Promise<void> => {
  await Promise.all([
    bundleEntryPoint(join(root, 'packages/pull-requests-github/src/pullRequestWorkerMain.ts'), join(outDir, 'pullRequestWorkerMain.js')),
    bundleEntryPoint(join(root, 'packages/github-worker/src/githubWorkerMain.ts'), join(outDir, 'githubWorkerMain.js')),
  ])
}
