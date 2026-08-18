export const getServerArgs = (): readonly string[] => {
  return ['node_modules/@lvce-editor/server/bin/server.js', '--only-extension=packages/pull-requests-github', '--test-path=packages/e2e']
}
