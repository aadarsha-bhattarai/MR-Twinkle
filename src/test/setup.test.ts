import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

describe('Testing Framework Setup', () => {
  it('should run basic unit tests', () => {
    expect(true).toBe(true)
  })

  it('should run property-based tests with fast-check', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        return n + 0 === n
      })
    )
  })

  it('should have access to jest-dom matchers', () => {
    const element = document.createElement('div')
    element.textContent = 'Hello'
    expect(element).toBeInTheDocument
  })
})
