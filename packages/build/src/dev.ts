import { execa } from 'execa'
import { getServerArgs } from './getServerArgs.ts'
import { root } from './root.ts'

const main = async (): Promise<void> => {
  execa(`npm`, ['run', 'build:watch'], {
    cwd: root,
    stdio: 'inherit',
  })
  execa('node', getServerArgs(), {
    cwd: root,
    stdio: 'inherit',
  })
}

main()
