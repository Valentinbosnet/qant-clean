declare module "lib/stock-service" {
  export const popularStocks: string[]
  export function getStockData(symbol: string): Promise<any>
  export function getStockQuote(symbol: string): Promise<any>
  export function getStockHistory(symbol: string): Promise<any[]>
  export function getMultipleStocks(symbols: string[]): Promise<any[]>
}
