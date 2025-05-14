import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { OfflineModeToggle } from "@/components/offline-mode-toggle"
import * as offlineMode from "@/lib/offline-mode"

// Mock the offline-mode module
jest.mock("@/lib/offline-mode", () => ({
  isOfflineModeEnabled: jest.fn(),
  setOfflineMode: jest.fn(),
}))

describe("OfflineModeToggle", () => {
  beforeEach(() => {
    jest
      .clearAllMocks()(
        // Default to offline mode disabled
        offlineMode.isOfflineModeEnabled as jest.Mock,
      )
      .mockReturnValue(false)
  })

  test("renders correctly when offline mode is disabled", () => {
    render(<OfflineModeToggle />)

    // Check that the component renders with the correct title
    expect(screen.getByText("Mode Hors Ligne")).toBeInTheDocument()

    // Check that the toggle is not checked
    const toggle = screen.getByRole("switch")
    expect(toggle).not.toBeChecked()

    // Check that the correct alert is shown
    expect(screen.getByText("Mode hors ligne désactivé")).toBeInTheDocument()
  })

  test("renders correctly when offline mode is enabled", () => {
    ;(offlineMode.isOfflineModeEnabled as jest.Mock).mockReturnValue(true)

    render(<OfflineModeToggle />)

    // Check that the component renders with the correct title
    expect(screen.getByText("Mode Hors Ligne")).toBeInTheDocument()

    // Check that the toggle is checked
    const toggle = screen.getByRole("switch")
    expect(toggle).toBeChecked()

    // Check that the correct alert is shown
    expect(screen.getByText("Mode hors ligne activé")).toBeInTheDocument()
  })

  test("toggles offline mode when clicked", async () => {
    render(<OfflineModeToggle />)

    // Find the toggle
    const toggle = screen.getByRole("switch")

    // Click the toggle
    fireEvent.click(toggle)

    // Wait for the toggle to be processed (there's a delay in the component)
    await waitFor(() => {
      // Check that setOfflineMode was called with true
      expect(offlineMode.setOfflineMode).toHaveBeenCalledWith(true)
    })
  })

  test("disables the toggle while loading", async () => {
    render(<OfflineModeToggle />)

    // Find the toggle
    const toggle = screen.getByRole("switch")

    // Click the toggle
    fireEvent.click(toggle)

    // The toggle should be disabled immediately after clicking
    expect(toggle).toBeDisabled()

    // Wait for the loading to complete
    await waitFor(() => {
      expect(toggle).not.toBeDisabled()
    })
  })
})
