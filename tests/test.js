const assert = require('assert')

const sum = (a, b) => a + b

describe('Sum', () => {
  it('sum(1,2) === 3?', () => {
    assert.strictEqual(sum(1, 2), 3)
  })
})
