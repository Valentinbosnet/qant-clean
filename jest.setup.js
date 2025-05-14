// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom"

// Mock localStorage
class LocalStorageMock {
  constructor() {
    this.store = {}
  }

  clear() {
    this.store = {}
  }

  getItem(key) {
    return this.store[key] || null
  }

  setItem(key, value) {
    this.store[key] = String(value)
  }

  removeItem(key) {
    delete this.store[key]
  }
}

// Set up a localStorage mock
global.localStorage = new LocalStorageMock()

// Mock navigator.onLine
Object.defineProperty(global.navigator, "onLine", {
  configurable: true,
  value: true,
})

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
  }),
)
