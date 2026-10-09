import assert from 'node:assert/strict'
import test from 'node:test'
import { enableConcurrentExtensionRerenders } from '../src/configureRuntime.ts'

const fixture = `otherView = { serializeCommands: () => serializeCommands1, };
// src/parts/ViewletExtensionView/ViewletExtensionView.ipc.ts
var ViewletExtensionView_ipc_exports = {};
__export(ViewletExtensionView_ipc_exports, {
  serializeCommands: () => serializeCommands2,
  setComponentState: () => setComponentState6
});
`

test('allows only extension rerenders to bypass command serialization, including cached installs', () => {
  const updated = enableConcurrentExtensionRerenders(fixture)
  assert.ok(updated.startsWith('otherView = { serializeCommands: () => serializeCommands1, };'))
  assert.ok(updated.includes('serializeCommands: () => serializeCommands2,'))
  assert.ok(updated.includes('concurrentCommands: () => ["rerender"],'))
  assert.equal(enableConcurrentExtensionRerenders(updated), updated)
})

test('rejects unknown renderer layouts instead of silently omitting compatibility', () => {
  assert.throws(() => enableConcurrentExtensionRerenders(''), /Missing extension view/)
  assert.throws(() => enableConcurrentExtensionRerenders(fixture.replace('serializeCommands: () => serializeCommands2,', '')), /serialization/)
  assert.throws(
    () =>
      enableConcurrentExtensionRerenders(
        fixture.replace('serializeCommands: () => serializeCommands2,', 'concurrentCommands: () => ["handleClick"],'),
      ),
    /Unexpected extension view concurrent commands/,
  )
})
