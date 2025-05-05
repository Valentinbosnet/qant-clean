export interface Prediction {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  lastUpdated: string
  isSimulated: boolean
  // Ajouter les propriétés supplémentaires de l'API premium
  open?: number
  high?: number
  low?: number
  // Ajouter les indicateurs techniques
  rsi?: number
  macd?: {
    value: number
    signal: string
    histogram: number[]
  }
  movingAverages?: {
    ma20: number
    ma50: number
    ma200: number
    alignment: string
  }
  bollingerBands?: {
    upper: number
    middle: number
    lower: number
    width: number
    trend: string
  }
  // Ajouter d'autres propriétés selon vos besoins
}
