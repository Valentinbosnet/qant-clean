"use client"
import { render, screen, act, waitFor } from "@testing-library/react"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import * as offlineMode from "@/lib/offline-mode"
import * as clientSupabase from "@/lib/client-supabase"

// Mock the dependencies
jest.mock("@/lib/offline-mode", () => ({
  isOfflineMode: jest.fn(),
  authenticateOfflineUser: jest.fn(),
  signOutOfflineUser: jest.fn(),
}))

jest.mock("@/lib/client-supabase", () => ({
  getClientSupabase: jest.fn(),
}))

jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

// Test component that uses the auth context
function TestComponent() {
  const { user, isAuthenticated, signIn, signOut } = useAuth()

  return (
    <div>
      <div data-testid="user-email">{user?.email || "No user"}</div>
      <div data-testid="is-authenticated">{isAuthenticated ? "Authenticated" : "Not authenticated"}</div>
      <button onClick={() => signIn("test@example.com", "password")}>Sign In</button>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}

describe("AuthContext", () => {
  beforeEach(() => {
    jest
      .clearAllMocks()(
        // Default to offline mode disabled
        offlineMode.isOfflineMode as jest.Mock,
      )
      .mockReturnValue(false)

    // Mock Supabase client
    const mockSupabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: null },
          error: null,
        }),
        signInWithPassword: jest.fn(),
        signOut: jest.fn(),
        onAuthStateChange: jest.fn().mockReturnValue({
          data: { subscription: { unsubscribe: jest.fn() } },
        }),
      },
    }(clientSupabase.getClientSupabase as jest.Mock).mockReturnValue(mockSupabase)
  })

  test("provides authentication context to children", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    // Wait for the initial session check to complete
    await waitFor(() => {
      expect(screen.getByTestId("user-email")).toHaveTextContent("No user")
      expect(screen.getByTestId("is-authenticated")).toHaveTextContent("Not authenticated")
    })
  })

  test("handles offline sign in", async () => {
    // Enable offline mode
    ;(offlineMode.isOfflineMode as jest.Mock).mockReturnValue(true)

    // Mock successful offline authentication
    const mockOfflineUser = {
      id: "offline-123",
      email: "offline@example.com",
      created_at: new Date().toISOString(),
      last_sign_in: new Date().toISOString(),
    }(offlineMode.authenticateOfflineUser as jest.Mock).mockReturnValue(mockOfflineUser)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    // Wait for the initial session check to complete
    await waitFor(() => {
      expect(screen.getByTestId("is-authenticated")).toHaveTextContent("Not authenticated")
    })

    // Click the sign in button
    const signInButton = screen.getByText("Sign In")
    await act(async () => {
      signInButton.click()
    })

    // Check that the user is now authenticated
    await waitFor(() => {
      expect(screen.getByTestId("user-email")).toHaveTextContent("offline@example.com")
      expect(screen.getByTestId("is-authenticated")).toHaveTextContent("Authenticated")
    })

    // Verify that the offline authentication function was called
    expect(offlineMode.authenticateOfflineUser).toHaveBeenCalledWith("test@example.com", "password")
  })

  test("handles offline sign out", async () => {
    // Enable offline mode
    ;(offlineMode.isOfflineMode as jest.Mock).mockReturnValue(true)

    // Mock successful offline authentication
    const mockOfflineUser = {
      id: "offline-123",
      email: "offline@example.com",
      created_at: new Date().toISOString(),
      last_sign_in: new Date().toISOString(),
    }(offlineMode.authenticateOfflineUser as jest.Mock).mockReturnValue(mockOfflineUser)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    // Sign in first
    const signInButton = screen.getByText("Sign In")
    await act(async () => {
      signInButton.click()
    })

    // Verify the user is authenticated
    await waitFor(() => {
      expect(screen.getByTestId("is-authenticated")).toHaveTextContent("Authenticated")
    })

    // Now sign out
    const signOutButton = screen.getByText("Sign Out")
    await act(async () => {
      signOutButton.click()
    })

    // Check that the user is now signed out
    await waitFor(() => {
      expect(screen.getByTestId("user-email")).toHaveTextContent("No user")
      expect(screen.getByTestId("is-authenticated")).toHaveTextContent("Not authenticated")
    })

    // Verify that the offline sign out function was called
    expect(offlineMode.signOutOfflineUser).toHaveBeenCalled()
  })
})
