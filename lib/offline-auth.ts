// This is a bridge file to maintain backward compatibility
// It re-exports the authentication functions from prefetch-service.ts

import {
  authenticateOfflineUser,
  storeOfflineUserData,
  isOfflineAuthAvailable,
  clearOfflineAuthData,
} from "./prefetch-service"

export { authenticateOfflineUser, storeOfflineUserData, isOfflineAuthAvailable, clearOfflineAuthData }
