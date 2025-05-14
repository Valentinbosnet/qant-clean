import {
  setOfflineMode,
  isOfflineModeEnabled,
  isOfflineMode,
  getOfflineUsers,
  addOfflineUser,
  authenticateOfflineUser,
  getCurrentOfflineUser,
  isOfflineAuthenticated,
  signOutOfflineUser,
  checkInternetConnection,
} from "@/lib/offline-mode"

// Reset localStorage before each test
beforeEach(() => {
  localStorage.clear()
  jest.clearAllMocks()
})

describe("Offline Mode Settings", () => {
  test("should enable offline mode", () => {
    setOfflineMode(true)
    expect(isOfflineModeEnabled()).toBe(true)
    expect(isOfflineMode()).toBe(true) // Test the alias function
  })

  test("should disable offline mode", () => {
    setOfflineMode(false)
    expect(isOfflineModeEnabled()).toBe(false)
    expect(isOfflineMode()).toBe(false) // Test the alias function
  })

  test("should default to false if not set", () => {
    expect(isOfflineModeEnabled()).toBe(false)
    expect(isOfflineMode()).toBe(false) // Test the alias function
  })
})

describe("Offline Users Management", () => {
  test("should return empty array when no users exist", () => {
    expect(getOfflineUsers()).toEqual([])
  })

  test("should add a new offline user", () => {
    const email = "test@example.com"
    const user = addOfflineUser(email)

    expect(user).toHaveProperty("id")
    expect(user.email).toBe(email)
    expect(user).toHaveProperty("created_at")
    expect(user).toHaveProperty("last_sign_in")

    const users = getOfflineUsers()
    expect(users).toHaveLength(1)
    expect(users[0].email).toBe(email)
  })

  test("should throw error when adding user with invalid email", () => {
    expect(() => addOfflineUser("invalid-email")).toThrow("Email invalide")
  })

  test("should throw error when adding duplicate user", () => {
    const email = "test@example.com"
    addOfflineUser(email)
    expect(() => addOfflineUser(email)).toThrow("Un compte existe déjà avec cette adresse email")
  })
})

describe("Offline Authentication", () => {
  test("should authenticate a user that does not exist yet", () => {
    const email = "new@example.com"
    const password = "password123"

    const user = authenticateOfflineUser(email, password)
    expect(user.email).toBe(email)

    // Should have created the user
    const users = getOfflineUsers()
    expect(users).toHaveLength(1)
    expect(users[0].email).toBe(email)

    // Should be authenticated
    expect(isOfflineAuthenticated()).toBe(true)
    expect(getCurrentOfflineUser()).not.toBeNull()
    expect(getCurrentOfflineUser()?.email).toBe(email)
  })

  test("should authenticate an existing user", () => {
    const email = "existing@example.com"
    addOfflineUser(email)

    const user = authenticateOfflineUser(email, "password123")
    expect(user.email).toBe(email)
    expect(isOfflineAuthenticated()).toBe(true)
  })

  test("should throw error with invalid credentials", () => {
    expect(() => authenticateOfflineUser("test@example.com", "short")).toThrow("Email ou mot de passe invalide")
    expect(() => authenticateOfflineUser("invalid-email", "password123")).toThrow("Email ou mot de passe invalide")
  })

  test("should sign out a user", () => {
    // First authenticate a user
    authenticateOfflineUser("test@example.com", "password123")
    expect(isOfflineAuthenticated()).toBe(true)

    // Then sign out
    signOutOfflineUser()
    expect(isOfflineAuthenticated()).toBe(false)
    expect(getCurrentOfflineUser()).toBeNull()
  })
})

describe("Internet Connectivity", () => {
  test("should detect online status when fetch succeeds", async () => {
    global.fetch = jest.fn().mockImplementationOnce(() => Promise.resolve({}))
    const isOnline = await checkInternetConnection()
    expect(isOnline).toBe(true)
    expect(fetch).toHaveBeenCalledWith("https://www.google.com/favicon.ico", expect.any(Object))
  })

  test("should detect offline status when fetch fails", async () => {
    global.fetch = jest.fn().mockImplementationOnce(() => Promise.reject(new Error("Network error")))
    const isOnline = await checkInternetConnection()
    expect(isOnline).toBe(false)
  })

  test("should detect offline status when navigator.onLine is false", async () => {
    Object.defineProperty(navigator, "onLine", { value: false, configurable: true })
    const isOnline = await checkInternetConnection()
    expect(isOnline).toBe(false)
    // Reset for other tests
    Object.defineProperty(navigator, "onLine", { value: true, configurable: true })
  })

  test("should timeout after 5 seconds", async () => {
    jest.useFakeTimers()
    global.fetch = jest.fn().mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          // This promise never resolves, simulating a timeout
        }),
    )

    const connectionPromise = checkInternetConnection()
    jest.advanceTimersByTime(5100) // Advance past the 5 second timeout

    const isOnline = await connectionPromise
    expect(isOnline).toBe(false)

    jest.useRealTimers()
  })
})
