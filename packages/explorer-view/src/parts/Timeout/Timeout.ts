export const sleep = async (duration: number): Promise<void> => {
  const { promise, resolve } = Promise.withResolvers()
  setTimeout(resolve, duration)
  await promise
}
