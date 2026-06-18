const RE_WHITESPACE = /^\s|\s$/

export const hasLeadingOrTrailingWhitespace = (text: string): boolean => {
  return RE_WHITESPACE.test(text)
}
