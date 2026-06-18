export const lastIndex = (array: readonly any[]): number => {
  return array.length - 1
}

export const fromAsync = async (asyncIterable: any): Promise<readonly any[]> => {
  const children = []
  for await (const value of asyncIterable) {
    children.push(value)
  }
  return children
}
