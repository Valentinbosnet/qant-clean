// Version ultra-simplifiée pour éviter les problèmes
export const apiQuota = {
  canMakeRequest: () => true,
  useRequest: () => true,
  getQuotaInfo: () => ({
    requestsRemaining: 100,
    maxRequests: 100,
    resetIn: 3600000,
  }),
}
