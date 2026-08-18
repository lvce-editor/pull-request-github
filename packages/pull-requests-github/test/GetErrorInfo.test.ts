import { expect, test } from '@jest/globals'
import { getErrorInfo } from '../src/parts/GetErrorInfo/GetErrorInfo.ts'

test('returns an error message and code', () => {
  const error = Object.assign(new Error('Invalid data'), { code: 'E_TEST_INVALID_DATA' })

  expect(getErrorInfo(error)).toEqual({
    code: 'E_TEST_INVALID_DATA',
    message: 'Invalid data',
  })
})

test('uses a fallback code for unclassified errors', () => {
  expect(getErrorInfo('Unexpected failure')).toEqual({
    code: 'E_UNKNOWN',
    message: 'Unexpected failure',
  })
})

test('uses a fallback message for an empty error', () => {
  expect(getErrorInfo('')).toEqual({
    code: 'E_UNKNOWN',
    message: 'An unknown error occurred.',
  })
})
