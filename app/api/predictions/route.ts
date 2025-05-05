import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getStockQuote, getStockHistory, getMultipleStocks, popularStocks, type StockData } from "@/lib/stock-service"

// Cache pour stocker les données récentes et éviter de trop nombreux appels API
interface CacheEntry {
  data: StockData
  timestamp: number
  history: { timestamp: string; price: number }[]
}

const cache: Record<string, CacheEntry> = {}
const CACHE_DURATION = 60000 // 1 minute en millisecondes

// Données d'analyse technique et de tendances (simulées car non disponibles via l'API gratuite)
const technicalAnalysis: Record<string, any> = {
  AAPL: {
    shortTerm: { trend: "bullish", percentage: 2.3 },
    mediumTerm: { trend: "bullish", percentage: 5.7 },
    longTerm: { trend: "neutral", percentage: 0.8 },
    fundamentals: {
      pe: 28.5,
      eps: 6.14,
      dividendYield: 0.52,
      marketCap: "2.85T",
      beta: 1.28,
      avgVolume: "58.7M",
    },
    technicalIndicators: {
      rsi: {
        value: 62.4,
        interpretation: "Neutre à légèrement suracheté",
        description:
          "L'indice de force relative (RSI) est à 62.4, ce qui indique que le titre n'est ni suracheté ni survendu, mais commence à approcher la zone de surachat (70).",
      },
      macd: {
        value: 1.85,
        signal: 1.32,
        histogram: 0.53,
        interpretation: "Haussier",
        description:
          "Le MACD (1.85) est au-dessus de sa ligne de signal (1.32) avec un histogramme positif, indiquant une dynamique haussière à court terme.",
      },
      movingAverages: {
        ma20: 175.23,
        ma50: 172.45,
        ma200: 168.78,
        interpretation: "Haussier",
        description:
          "Le prix actuel est au-dessus des moyennes mobiles à 20, 50 et 200 jours, formant une structure haussière. La MA20 > MA50 > MA200 confirme une tendance haussière.",
      },
      bollingerBands: {
        upper: 182.45,
        middle: 175.23,
        lower: 168.01,
        width: 8.24,
        interpretation: "Neutre",
        description:
          "Le prix évolue près de la bande médiane des bandes de Bollinger, avec une volatilité modérée (largeur de 8.24).",
      },
      supportResistance: {
        supports: [172.5, 168.75, 165.2],
        resistances: [178.3, 182.45, 185.7],
        interpretation: "Consolidation avec biais haussier",
        description:
          "Le titre évolue dans un canal entre le support à 172.50$ et la résistance à 178.30$. Un franchissement de la résistance pourrait déclencher une accélération vers 182.45$.",
      },
    },
    volumeAnalysis: {
      trend: "Croissant",
      interpretation: "Confirmation de tendance",
      description:
        "Le volume des transactions augmente lors des journées haussières et diminue lors des baisses, ce qui confirme la tendance haussière actuelle.",
    },
    patternRecognition: {
      pattern: "Cup and Handle",
      reliability: "Modérée",
      target: 185.5,
      description:
        "Formation d'une figure en 'tasse et anse' sur le graphique journalier, suggérant un potentiel de hausse vers 185.50$ si le breakout se confirme.",
    },
    analysis:
      "Apple montre des signaux techniques globalement positifs à court et moyen terme. Le RSI à 62.4 indique une dynamique positive sans être en zone de surachat, tandis que le MACD confirme cette tendance avec un signal haussier. Les moyennes mobiles sont alignées de façon haussière (MA20 > MA50 > MA200), et le prix évolue au-dessus de ces niveaux clés.\n\nLe titre se trouve actuellement dans une phase de consolidation entre le support à 172.50$ et la résistance à 178.30$. La formation d'une figure en 'tasse et anse' suggère un potentiel de hausse si le prix parvient à franchir la résistance avec volume. Les fondamentaux restent solides avec un PE de 28.5, légèrement au-dessus de la moyenne historique mais justifié par la croissance continue des services.\n\nStratégie suggérée: Une entrée pourrait être envisagée sur un test réussi du support à 172.50$ ou sur une cassure confirmée de la résistance à 178.30$ avec volume. Placer un stop-loss sous 168.75$ pour limiter le risque. Objectif de prix à court terme: 182.45$, objectif à moyen terme: 185.50$.",
  },
  MSFT: {
    shortTerm: { trend: "bullish", percentage: 3.1 },
    mediumTerm: { trend: "bullish", percentage: 7.2 },
    longTerm: { trend: "bullish", percentage: 12.5 },
    fundamentals: {
      pe: 34.2,
      eps: 9.87,
      dividendYield: 0.73,
      marketCap: "2.92T",
      beta: 0.93,
      avgVolume: "26.3M",
    },
    technicalIndicators: {
      rsi: {
        value: 58.7,
        interpretation: "Neutre",
        description:
          "L'indice de force relative (RSI) est à 58.7, indiquant un équilibre entre acheteurs et vendeurs avec un léger avantage haussier.",
      },
      macd: {
        value: 2.43,
        signal: 1.87,
        histogram: 0.56,
        interpretation: "Haussier",
        description:
          "Le MACD (2.43) est au-dessus de sa ligne de signal (1.87) avec un histogramme positif croissant, signalant une forte dynamique haussière.",
      },
      movingAverages: {
        ma20: 335.67,
        ma50: 328.92,
        ma200: 310.45,
        interpretation: "Fortement haussier",
        description:
          "Structure haussière parfaite avec prix > MA20 > MA50 > MA200, confirmant une tendance de fond solide.",
      },
      bollingerBands: {
        upper: 348.32,
        middle: 335.67,
        lower: 323.02,
        width: 7.53,
        interpretation: "Approche de la bande supérieure",
        description:
          "Le prix s'approche de la bande supérieure de Bollinger, indiquant une force dans la tendance actuelle, mais attention au risque de surachat à court terme.",
      },
      supportResistance: {
        supports: [332.5, 325.8, 318.25],
        resistances: [342.75, 348.3, 355.0],
        interpretation: "Tendance haussière avec niveaux clés",
        description:
          "Le titre évolue dans un canal ascendant avec un support immédiat à 332.50$ et une résistance à 342.75$. La structure des prix reste haussière tant que le support à 325.80$ tient.",
      },
    },
    volumeAnalysis: {
      trend: "Stable avec pics haussiers",
      interpretation: "Soutien institutionnel",
      description:
        "Volume stable avec des pics lors des mouvements haussiers, suggérant un soutien institutionnel continu et une accumulation progressive.",
    },
    patternRecognition: {
      pattern: "Ascending Triangle",
      reliability: "Élevée",
      target: 355.0,
      description:
        "Formation d'un triangle ascendant sur le graphique hebdomadaire, avec un objectif technique à 355.00$ en cas de cassure de la résistance horizontale.",
    },
    analysis:
      "Microsoft présente un profil technique robuste avec une configuration haussière sur tous les horizons temporels. Le RSI à 58.7 montre une dynamique positive équilibrée, tandis que le MACD confirme cette force avec un signal clairement haussier et un histogramme positif croissant.\n\nLa structure des moyennes mobiles est idéalement alignée (prix > MA20 > MA50 > MA200), ce qui témoigne d'une tendance de fond solide. Le titre évolue dans un canal ascendant bien défini, avec un support immédiat à 332.50$ et une résistance à 342.75$.\n\nLa formation d'un triangle ascendant sur le graphique hebdomadaire est particulièrement significative, avec un objectif technique à 355.00$ en cas de cassure de la résistance. Les fondamentaux soutiennent cette perspective haussière, avec une croissance continue du cloud Azure et des initiatives en IA qui justifient un PE de 34.2, supérieur à la moyenne du secteur.\n\nStratégie suggérée: Positions acheteuses peuvent être renforcées sur des replis vers le support à 332.50$ ou sur une cassure confirmée de 342.75$ avec volume. Placer un stop-loss sous 325.80$ pour gérer le risque. Objectif de prix à court terme: 348.30$, objectif à moyen terme: 355.00$. Une stratégie d'accumulation progressive est recommandée pour les investisseurs à long terme.",
  },
  GOOGL: {
    shortTerm: { trend: "neutral", percentage: 0.5 },
    mediumTerm: { trend: "bullish", percentage: 4.3 },
    longTerm: { trend: "bullish", percentage: 9.7 },
    fundamentals: {
      pe: 25.1,
      eps: 5.8,
      dividendYield: 0.48,
      marketCap: "1.78T",
      beta: 1.06,
      avgVolume: "31.2M",
    },
    technicalIndicators: {
      rsi: {
        value: 49.8,
        interpretation: "Neutre",
        description:
          "L'indice de force relative (RSI) est à 49.8, proche du niveau médian de 50, indiquant un équilibre parfait entre acheteurs et vendeurs.",
      },
      macd: {
        value: 0.32,
        signal: 0.45,
        histogram: -0.13,
        interpretation: "Légèrement baissier à court terme",
        description:
          "Le MACD (0.32) est légèrement sous sa ligne de signal (0.45) avec un histogramme négatif mais peu prononcé, suggérant une faiblesse temporaire.",
      },
      movingAverages: {
        ma20: 141.85,
        ma50: 140.23,
        ma200: 135.67,
        interpretation: "Haussier avec consolidation",
        description:
          "Le prix évolue autour de la MA20 (141.85) mais reste au-dessus des MA50 et MA200, indiquant une tendance haussière de fond avec une phase de consolidation à court terme.",
      },
      bollingerBands: {
        upper: 147.32,
        middle: 141.85,
        lower: 136.38,
        width: 7.71,
        interpretation: "Neutre, au milieu des bandes",
        description:
          "Le prix évolue près de la bande médiane des Bollinger, suggérant une absence de momentum directionnel fort à court terme.",
      },
      supportResistance: {
        supports: [140.25, 137.5, 134.8],
        resistances: [144.75, 147.3, 150.0],
        interpretation: "Range trading avec biais haussier",
        description:
          "Le titre oscille dans une fourchette entre 140.25$ et 144.75$. La structure reste haussière tant que le support à 137.50$ n'est pas enfoncé.",
      },
    },
    volumeAnalysis: {
      trend: "En baisse",
      interpretation: "Consolidation",
      description:
        "Volume en baisse progressive, typique des phases de consolidation. Une reprise du volume sera nécessaire pour confirmer la prochaine direction.",
    },
    patternRecognition: {
      pattern: "Rectangle",
      reliability: "Moyenne",
      target: 150.0,
      description:
        "Formation d'un rectangle de consolidation entre 140.25$ et 144.75$. La direction de la sortie de cette figure déterminera le prochain mouvement significatif.",
    },
    analysis:
      "Alphabet (GOOGL) présente actuellement un profil technique neutre à court terme mais conserve un biais haussier à moyen et long terme. Le RSI à 49.8 indique un parfait équilibre entre acheteurs et vendeurs, tandis que le MACD montre un léger essoufflement temporaire de la dynamique haussière.\n\nLe titre est entré dans une phase de consolidation horizontale, oscillant dans un rectangle entre 140.25$ et 144.75$. Cette consolidation intervient après une période de hausse et peut être interprétée comme une pause technique saine. La structure des moyennes mobiles reste positive (prix > MA50 > MA200), même si le cours évolue actuellement autour de sa MA20.\n\nLes fondamentaux d'Alphabet restent solides avec un PE de 25.1, raisonnable pour une entreprise de cette qualité et ce potentiel de croissance. Les récents développements en IA et la croissance continue de la publicité en ligne soutiennent les perspectives à moyen terme.\n\nStratégie suggérée: Adopter une approche d'accumulation progressive sur les replis vers le support à 140.25$. Alternativement, attendre une cassure confirmée (avec volume) de la résistance à 144.75$ pour initier ou renforcer des positions. Placer un stop-loss sous 137.50$ pour limiter le risque. Objectif de prix à court terme en cas de breakout haussier: 147.30$, objectif à moyen terme: 150.00$.",
  },
  AMZN: {
    shortTerm: { trend: "bullish", percentage: 1.8 },
    mediumTerm: { trend: "bullish", percentage: 6.5 },
    longTerm: { trend: "bullish", percentage: 15.2 },
    fundamentals: {
      pe: 42.3,
      eps: 3.45,
      dividendYield: 0,
      marketCap: "1.65T",
      beta: 1.22,
      avgVolume: "43.8M",
    },
    technicalIndicators: {
      rsi: {
        value: 65.3,
        interpretation: "Légèrement suracheté",
        description:
          "L'indice de force relative (RSI) est à 65.3, indiquant une dynamique haussière forte qui approche de la zone de surachat (70).",
      },
      macd: {
        value: 2.87,
        signal: 2.15,
        histogram: 0.72,
        interpretation: "Fortement haussier",
        description:
          "Le MACD (2.87) est nettement au-dessus de sa ligne de signal (2.15) avec un histogramme positif large, confirmant une forte dynamique haussière.",
      },
      movingAverages: {
        ma20: 143.25,
        ma50: 138.67,
        ma200: 130.42,
        interpretation: "Fortement haussier",
        description:
          "Configuration idéalement haussière avec prix > MA20 > MA50 > MA200, confirmant une tendance de fond solide sur tous les horizons temporels.",
      },
      bollingerBands: {
        upper: 151.45,
        middle: 143.25,
        lower: 135.05,
        width: 11.45,
        interpretation: "Proche de la bande supérieure",
        description:
          "Le prix évolue près de la bande supérieure de Bollinger, indiquant une forte dynamique haussière, mais aussi un risque de surachat à court terme.",
      },
      supportResistance: {
        supports: [142.5, 138.7, 134.25],
        resistances: [148.3, 151.45, 155.0],
        interpretation: "Tendance haussière avec objectifs clairs",
        description:
          "Le titre évolue dans un canal ascendant avec un support immédiat à 142.50$ et une résistance à 148.30$. La structure reste fortement haussière tant que le support à 138.70$ tient.",
      },
    },
    volumeAnalysis: {
      trend: "En hausse",
      interpretation: "Confirmation de tendance",
      description:
        "Volume en augmentation lors des journées haussières, confirmant la force de la tendance actuelle et l'intérêt institutionnel.",
    },
    patternRecognition: {
      pattern: "Bull Flag",
      reliability: "Élevée",
      target: 155.0,
      description:
        "Formation d'un 'drapeau haussier' après une forte impulsion, suggérant une continuation probable de la tendance avec un objectif technique à 155.00$.",
    },
    analysis:
      "Amazon (AMZN) présente un profil technique résolument haussier sur tous les horizons temporels. Le RSI à 65.3 indique une forte dynamique positive qui approche de la zone de surachat, tandis que le MACD confirme cette force avec un signal clairement haussier et un histogramme positif large.\n\nLa structure des moyennes mobiles est parfaitement alignée (prix > MA20 > MA50 > MA200), témoignant d'une tendance de fond solide. Le titre évolue dans un canal ascendant bien défini, avec un support immédiat à 142.50$ et une résistance à 148.30$.\n\nLa formation d'un 'drapeau haussier' est particulièrement significative, suggérant une probable continuation de la tendance après cette courte phase de consolidation. Les fondamentaux d'Amazon soutiennent cette perspective haussière, avec une croissance continue d'AWS et l'amélioration des marges dans le commerce électronique qui justifient un PE de 42.3, supérieur à la moyenne du marché.\n\nStratégie suggérée: Les positions acheteuses peuvent être initiées sur des replis vers le support à 142.50$ ou sur une cassure confirmée de 148.30$ avec volume. Placer un stop-loss sous 138.70$ pour gérer le risque. Objectif de prix à court terme: 151.45$, objectif à moyen terme: 155.00$. Pour les traders plus agressifs, la formation en drapeau offre un bon ratio risque/rendement pour des positions à court terme.",
  },
  TSLA: {
    shortTerm: { trend: "bearish", percentage: -2.1 },
    mediumTerm: { trend: "neutral", percentage: 0.3 },
    longTerm: { trend: "bullish", percentage: 8.9 },
    fundamentals: {
      pe: 68.7,
      eps: 3.47,
      dividendYield: 0,
      marketCap: "758B",
      beta: 2.04,
      avgVolume: "125.3M",
    },
    technicalIndicators: {
      rsi: {
        value: 42.5,
        interpretation: "Neutre à légèrement survendu",
        description:
          "L'indice de force relative (RSI) est à 42.5, légèrement sous le niveau médian de 50, indiquant une faiblesse à court terme sans être en zone de survente.",
      },
      macd: {
        value: -1.85,
        signal: -1.32,
        histogram: -0.53,
        interpretation: "Baissier",
        description:
          "Le MACD (-1.85) est sous sa ligne de signal (-1.32) avec un histogramme négatif, confirmant une dynamique baissière à court terme.",
      },
      movingAverages: {
        ma20: 242.35,
        ma50: 245.67,
        ma200: 230.42,
        interpretation: "Baissier à court terme, haussier à long terme",
        description:
          "Le prix est sous les MA20 et MA50 mais reste au-dessus de la MA200, suggérant une correction dans une tendance de fond haussière.",
      },
      bollingerBands: {
        upper: 258.45,
        middle: 242.35,
        lower: 226.25,
        width: 13.28,
        interpretation: "Proche de la bande inférieure",
        description:
          "Le prix évolue près de la bande inférieure de Bollinger, indiquant une faiblesse à court terme mais aussi un potentiel rebond technique.",
      },
      supportResistance: {
        supports: [232.5, 225.7, 218.25],
        resistances: [245.3, 252.45, 260.0],
        interpretation: "Correction dans une tendance de fond haussière",
        description:
          "Le titre est en correction avec un support immédiat à 232.50$ et une résistance à 245.30$. La structure de long terme reste haussière tant que le support à 218.25$ tient.",
      },
    },
    volumeAnalysis: {
      trend: "En hausse sur les baisses",
      interpretation: "Distribution",
      description:
        "Volume en augmentation lors des journées baissières, suggérant une distribution et une pression vendeuse à court terme.",
    },
    patternRecognition: {
      pattern: "Head and Shoulders Top",
      reliability: "Moyenne",
      target: 225.0,
      description:
        "Formation potentielle d'une figure en 'tête et épaules', figure de retournement baissier, avec un objectif technique à 225.00$ si le 'neckline' à 232.50$ est enfoncé.",
    },
    analysis:
      "Tesla (TSLA) présente actuellement un profil technique baissier à court terme, neutre à moyen terme, mais conserve un biais haussier à long terme. Le RSI à 42.5 indique une faiblesse à court terme sans être en zone de survente, tandis que le MACD confirme cette faiblesse avec un signal baissier.\n\nLe titre est entré dans une phase de correction, évoluant sous ses moyennes mobiles à 20 et 50 jours, mais reste au-dessus de sa MA200, ce qui suggère que cette correction s'inscrit dans une tendance de fond qui demeure haussière. La formation potentielle d'une figure en 'tête et épaules' est préoccupante à court terme, avec un objectif baissier à 225.00$ si le support à 232.50$ est enfoncé.\n\nLes fondamentaux de Tesla restent contrastés, avec un PE élevé de 68.7 qui reflète les attentes de croissance future mais aussi la vulnérabilité à toute déception. Les défis actuels incluent l'intensification de la concurrence et les pressions sur les marges.\n\nStratégie suggérée: Pour les positions existantes, envisager de réduire l'exposition ou de placer un stop-loss sous 232.50$. Pour les nouveaux entrants, attendre soit un test réussi du support majeur à 225.70$ avec signes de retournement, soit une cassure confirmée au-dessus de 245.30$ avec volume. À court terme, privilégier les opérations de trading plutôt que l'investissement à long terme, en raison de la volatilité attendue.",
  },
  META: {
    shortTerm: { trend: "bullish", percentage: 2.5 },
    mediumTerm: { trend: "bullish", percentage: 5.8 },
    longTerm: { trend: "neutral", percentage: 1.2 },
    fundamentals: {
      pe: 23.8,
      eps: 14.87,
      dividendYield: 0.48,
      marketCap: "1.12T",
      beta: 1.34,
      avgVolume: "18.7M",
    },
    technicalIndicators: {
      rsi: {
        value: 57.8,
        interpretation: "Neutre",
        description:
          "L'indice de force relative (RSI) est à 57.8, légèrement au-dessus du niveau médian de 50, indiquant un léger avantage aux acheteurs sans excès.",
      },
      macd: {
        value: 1.45,
        signal: 1.12,
        histogram: 0.33,
        interpretation: "Haussier",
        description:
          "Le MACD (1.45) est au-dessus de sa ligne de signal (1.12) avec un histogramme positif, confirmant une dynamique haussière à court terme.",
      },
      movingAverages: {
        ma20: 482.35,
        ma50: 475.67,
        ma200: 465.42,
        interpretation: "Haussier",
        description:
          "Configuration haussière avec prix > MA20 > MA50 > MA200, confirmant une tendance positive sur tous les horizons temporels.",
      },
      bollingerBands: {
        upper: 498.45,
        middle: 482.35,
        lower: 466.25,
        width: 6.68,
        interpretation: "Neutre, au milieu des bandes",
        description:
          "Le prix évolue près de la bande médiane des Bollinger, suggérant un équilibre entre acheteurs et vendeurs à court terme.",
      },
      supportResistance: {
        supports: [478.5, 472.7, 465.25],
        resistances: [490.3, 498.45, 505.0],
        interpretation: "Tendance haussière avec consolidation",
        description:
          "Le titre évolue dans un canal ascendant avec un support immédiat à 478.50$ et une résistance à 490.30$. La structure reste haussière tant que le support à 472.70$ tient.",
      },
    },
    volumeAnalysis: {
      trend: "Stable",
      interpretation: "Consolidation",
      description:
        "Volume stable, typique des phases de consolidation. Une augmentation du volume sera nécessaire pour confirmer la prochaine impulsion directionnelle.",
    },
    patternRecognition: {
      pattern: "Ascending Channel",
      reliability: "Élevée",
      target: 505.0,
      description:
        "Évolution dans un canal ascendant bien défini, suggérant une continuation de la tendance haussière tant que le support du canal tient.",
    },
    analysis:
      "Meta Platforms (META) présente un profil technique haussier à court et moyen terme, avec une perspective plus neutre à long terme. Le RSI à 57.8 indique un léger avantage aux acheteurs sans excès, tandis que le MACD confirme cette tendance avec un signal haussier.\n\nLa structure des moyennes mobiles est bien alignée (prix > MA20 > MA50 > MA200), témoignant d'une tendance positive sur tous les horizons temporels. Le titre évolue dans un canal ascendant bien défini, avec un support immédiat à 478.50$ et une résistance à 490.30$.\n\nLes fondamentaux de Meta se sont nettement améliorés, avec un PE de 23.8 qui semble raisonnable compte tenu de la reprise de la croissance des revenus publicitaires et des efforts de réduction des coûts. Les investissements dans l'IA et le métavers représentent à la fois une opportunité et un risque pour l'avenir.\n\nStratégie suggérée: Les positions acheteuses peuvent être initiées sur des replis vers le support à 478.50$ ou sur une cassure confirmée de 490.30$ avec volume. Placer un stop-loss sous 472.70$ pour gérer le risque. Objectif de prix à court terme: 498.45$, objectif à moyen terme: 505.00$. Pour les investisseurs à long terme, une stratégie d'accumulation progressive est recommandée, en gardant à l'esprit les risques liés aux investissements massifs dans le métavers.",
  },
  NVDA: {
    shortTerm: { trend: "bullish", percentage: 4.2 },
    mediumTerm: { trend: "bullish", percentage: 9.5 },
    longTerm: { trend: "bullish", percentage: 18.7 },
    fundamentals: {
      pe: 72.5,
      eps: 12.15,
      dividendYield: 0.03,
      marketCap: "2.25T",
      beta: 1.65,
      avgVolume: "42.8M",
    },
    technicalIndicators: {
      rsi: {
        value: 68.7,
        interpretation: "Proche de surachat",
        description:
          "L'indice de force relative (RSI) est à 68.7, proche de la zone de surachat (70), indiquant une forte dynamique haussière qui pourrait nécessiter une consolidation à court terme.",
      },
      macd: {
        value: 15.45,
        signal: 12.32,
        histogram: 3.13,
        interpretation: "Fortement haussier",
        description:
          "Le MACD (15.45) est nettement au-dessus de sa ligne de signal (12.32) avec un histogramme positif large, confirmant une dynamique haussière exceptionnelle.",
      },
      movingAverages: {
        ma20: 875.35,
        ma50: 825.67,
        ma200: 680.42,
        interpretation: "Fortement haussier",
        description:
          "Configuration exceptionnellement haussière avec prix >> MA20 >> MA50 >> MA200 et un écart important entre chaque niveau, confirmant une tendance puissante sur tous les horizons temporels.",
      },
      bollingerBands: {
        upper: 925.45,
        middle: 875.35,
        lower: 825.25,
        width: 11.45,
        interpretation: "Proche de la bande supérieure",
        description:
          "Le prix évolue près de la bande supérieure de Bollinger, indiquant une forte dynamique haussière, mais aussi un risque de surachat à court terme.",
      },
      supportResistance: {
        supports: [870.5, 845.7, 825.25],
        resistances: [900.3, 925.45, 950.0],
        interpretation: "Tendance fortement haussière",
        description:
          "Le titre évolue dans un canal ascendant puissant avec un support immédiat à 870.50$ et une résistance à 900.30$. La structure reste exceptionnellement haussière tant que le support à 845.70$ tient.",
      },
    },
    volumeAnalysis: {
      trend: "En forte hausse",
      interpretation: "Confirmation de tendance et intérêt institutionnel",
      description:
        "Volume en forte augmentation lors des journées haussières, confirmant la puissance de la tendance actuelle et l'intérêt institutionnel massif.",
    },
    patternRecognition: {
      pattern: "Parabolic Rise",
      reliability: "Attention à la surchauffe",
      target: 950.0,
      description:
        "Mouvement parabolique haussier, typique des phases finales d'une tendance forte. Potentiel de continuation à court terme mais risque accru de correction brutale.",
    },
    analysis:
      "NVIDIA (NVDA) présente un profil technique exceptionnellement haussier sur tous les horizons temporels, porté par l'engouement pour l'IA. Le RSI à 68.7 indique une forte dynamique positive proche de la zone de surachat, tandis que le MACD confirme cette puissance avec un signal fortement haussier et un histogramme positif très large.\n\nLa structure des moyennes mobiles montre une configuration idéale avec des écarts importants entre chaque niveau (prix >> MA20 >> MA50 >> MA200), témoignant d'une tendance de fond exceptionnellement puissante. Le titre évolue dans un canal ascendant dynamique, avec un support immédiat à 870.50$ et une résistance à 900.30$.\n\nLe mouvement parabolique observé est caractéristique des phases d'euphorie de marché, particulièrement dans le secteur technologique. Si cette dynamique peut se poursuivre à court terme, elle augmente également le risque d'une correction brutale lorsque le momentum s'essoufflera.\n\nLes fondamentaux de NVIDIA sont solides mais le PE de 72.5 reflète des attentes extrêmement élevées qui laissent peu de place à la déception. La domination de l'entreprise dans le secteur des GPU pour l'IA justifie une prime, mais la valorisation actuelle intègre déjà une croissance exceptionnelle.\n\nStratégie suggérée: Pour les positions existantes, envisager de prendre des bénéfices partiels ou d'utiliser des stops glissants pour protéger les gains. Pour les nouveaux entrants, la prudence est de mise; privilégier des entrées sur des replis techniques vers le support à 870.50$ ou 845.70$. Objectif de prix à court terme: 925.45$, avec potentiel d'extension vers 950.00$ en cas de poursuite de l'euphorie. Garder à l'esprit que plus la hausse est verticale, plus la correction potentielle pourrait être sévère.",
  },
  JPM: {
    shortTerm: { trend: "neutral", percentage: 0.3 },
    mediumTerm: { trend: "bullish", percentage: 3.2 },
    longTerm: { trend: "bullish", percentage: 7.1 },
    fundamentals: {
      pe: 12.3,
      eps: 15.78,
      dividendYield: 2.25,
      marketCap: "565B",
      beta: 1.12,
      avgVolume: "9.8M",
    },
    technicalIndicators: {
      rsi: {
        value: 52.4,
        interpretation: "Neutre",
        description:
          "L'indice de force relative (RSI) est à 52.4, légèrement au-dessus du niveau médian de 50, indiquant un équilibre entre acheteurs et vendeurs avec un léger avantage haussier.",
      },
      macd: {
        value: 0.85,
        signal: 0.72,
        histogram: 0.13,
        interpretation: "Légèrement haussier",
        description:
          "Le MACD (0.85) est légèrement au-dessus de sa ligne de signal (0.72) avec un histogramme positif mais peu prononcé, suggérant une dynamique haussière modérée.",
      },
      movingAverages: {
        ma20: 193.35,
        ma50: 190.67,
        ma200: 182.42,
        interpretation: "Haussier",
        description:
          "Configuration haussière avec prix > MA20 > MA50 > MA200, confirmant une tendance positive sur tous les horizons temporels.",
      },
      bollingerBands: {
        upper: 201.45,
        middle: 193.35,
        lower: 185.25,
        width: 8.38,
        interpretation: "Neutre, au milieu des bandes",
        description:
          "Le prix évolue près de la bande médiane des Bollinger, suggérant un équilibre entre acheteurs et vendeurs à court terme.",
      },
      supportResistance: {
        supports: [190.5, 186.7, 182.25],
        resistances: [197.3, 201.45, 205.0],
        interpretation: "Consolidation avec biais haussier",
        description:
          "Le titre évolue dans une phase de consolidation avec un support immédiat à 190.50$ et une résistance à 197.30$. La structure reste haussière tant que le support à 186.70$ tient.",
      },
    },
    volumeAnalysis: {
      trend: "Stable",
      interpretation: "Accumulation progressive",
      description:
        "Volume stable avec légère augmentation sur les journées haussières, suggérant une accumulation progressive et un intérêt institutionnel continu.",
    },
    patternRecognition: {
      pattern: "Bullish Rectangle",
      reliability: "Moyenne à élevée",
      target: 205.0,
      description:
        "Formation d'un rectangle de consolidation avec biais haussier. Un breakout au-dessus de 197.30$ pourrait déclencher une nouvelle jambe de hausse vers 205.00$.",
    },
    analysis:
      "JPMorgan Chase (JPM) présente un profil technique neutre à court terme mais conserve un biais haussier à moyen et long terme. Le RSI à 52.4 indique un équilibre entre acheteurs et vendeurs avec un léger avantage haussier, tandis que le MACD montre une dynamique positive modérée.\n\nLa structure des moyennes mobiles reste favorable (prix > MA20 > MA50 > MA200), témoignant d'une tendance de fond positive. Le titre est entré dans une phase de consolidation horizontale, oscillant entre le support à 190.50$ et la résistance à 197.30$.\n\nLes fondamentaux de JPMorgan sont solides, avec un PE attractif de 12.3 et un rendement du dividende intéressant de 2.25%. La banque bénéficie d'un environnement de taux d'intérêt favorable et d'une gestion prudente qui la positionne avantageusement par rapport à ses concurrents.\n\nStratégie suggérée: Adopter une approche d'accumulation progressive sur les replis vers le support à 190.50$. Alternativement, attendre une cassure confirmée (avec volume) de la résistance à 197.30$ pour initier ou renforcer des positions. Placer un stop-loss sous 186.70$ pour limiter le risque. Objectif de prix à court terme en cas de breakout haussier: 201.45$, objectif à moyen terme: 205.00$. Pour les investisseurs à long terme, JPM offre un bon équilibre entre valorisation attractive et potentiel de croissance.",
  },
  V: {
    shortTerm: { trend: "bullish", percentage: 1.7 },
    mediumTerm: { trend: "bullish", percentage: 4.9 },
    longTerm: { trend: "bullish", percentage: 10.3 },
    fundamentals: {
      pe: 30.5,
      eps: 8.92,
      dividendYield: 0.75,
      marketCap: "575B",
      beta: 0.96,
      avgVolume: "7.5M",
    },
    technicalIndicators: {
      rsi: {
        value: 61.8,
        interpretation: "Modérément haussier",
        description:
          "L'indice de force relative (RSI) est à 61.8, indiquant une dynamique haussière sans être en zone de surachat.",
      },
      macd: {
        value: 2.15,
        signal: 1.87,
        histogram: 0.28,
        interpretation: "Haussier",
        description:
          "Le MACD (2.15) est au-dessus de sa ligne de signal (1.87) avec un histogramme positif, confirmant une dynamique haussière à court terme.",
      },
      movingAverages: {
        ma20: 272.35,
        ma50: 268.67,
        ma200: 260.42,
        interpretation: "Haussier",
        description:
          "Configuration haussière avec prix > MA20 > MA50 > MA200, confirmant une tendance positive sur tous les horizons temporels.",
      },
      bollingerBands: {
        upper: 282.45,
        middle: 272.35,
        lower: 262.25,
        width: 7.42,
        interpretation: "Approche de la bande supérieure",
        description:
          "Le prix s'approche de la bande supérieure de Bollinger, indiquant une force dans la tendance actuelle.",
      },
      supportResistance: {
        supports: [270.5, 265.7, 260.25],
        resistances: [278.3, 282.45, 290.0],
        interpretation: "Tendance haussière avec niveaux clés",
        description:
          "Le titre évolue dans un canal ascendant avec un support immédiat à 270.50$ et une résistance à 278.30$. La structure reste haussière tant que le support à 265.70$ tient.",
      },
    },
    volumeAnalysis: {
      trend: "Stable avec pics haussiers",
      interpretation: "Soutien institutionnel",
      description:
        "Volume stable avec des pics lors des mouvements haussiers, suggérant un soutien institutionnel continu.",
    },
    patternRecognition: {
      pattern: "Ascending Channel",
      reliability: "Élevée",
      target: 290.0,
      description:
        "Évolution dans un canal ascendant bien défini, suggérant une continuation de la tendance haussière tant que le support du canal tient.",
    },
    analysis:
      "Visa (V) présente un profil technique haussier sur tous les horizons temporels. Le RSI à 61.8 indique une dynamique positive sans être en zone de surachat, tandis que le MACD confirme cette tendance avec un signal haussier.\n\nLa structure des moyennes mobiles est bien alignée (prix > MA20 > MA50 > MA200), témoignant d'une tendance positive sur tous les horizons temporels. Le titre évolue dans un canal ascendant bien défini, avec un support immédiat à 270.50$ et une résistance à 278.30$.\n\nLes fondamentaux de Visa restent solides, avec un modèle d'affaires résilient qui bénéficie de la transition mondiale vers les paiements numériques. Le PE de 30.5 peut sembler élevé mais se justifie par la qualité du business, les marges exceptionnelles et la croissance régulière.\n\nStratégie suggérée: Les positions acheteuses peuvent être initiées sur des replis vers le support à 270.50$ ou sur une cassure confirmée de 278.30$ avec volume. Placer un stop-loss sous 265.70$ pour gérer le risque. Objectif de prix à court terme: 282.45$, objectif à moyen terme: 290.00$. Pour les investisseurs à long terme, Visa représente une valeur de qualité à accumuler progressivement, particulièrement lors des phases de consolidation du marché.",
  },
  WMT: {
    shortTerm: { trend: "neutral", percentage: 0.8 },
    mediumTerm: { trend: "bullish", percentage: 3.5 },
    longTerm: { trend: "bullish", percentage: 6.2 },
    fundamentals: {
      pe: 28.7,
      eps: 2.15,
      dividendYield: 1.35,
      marketCap: "425B",
      beta: 0.54,
      avgVolume: "8.2M",
    },
    technicalIndicators: {
      rsi: {
        value: 54.2,
        interpretation: "Neutre",
        description:
          "L'indice de force relative (RSI) est à 54.2, légèrement au-dessus du niveau médian de 50, indiquant un équilibre entre acheteurs et vendeurs avec un léger avantage haussier.",
      },
      macd: {
        value: 0.45,
        signal: 0.38,
        histogram: 0.07,
        interpretation: "Légèrement haussier",
        description:
          "Le MACD (0.45) est légèrement au-dessus de sa ligne de signal (0.38) avec un histogramme positif mais peu prononcé, suggérant une dynamique haussière modérée.",
      },
      movingAverages: {
        ma20: 61.35,
        ma50: 60.67,
        ma200: 58.42,
        interpretation: "Haussier",
        description:
          "Configuration haussière avec prix > MA20 > MA50 > MA200, confirmant une tendance positive sur tous les horizons temporels.",
      },
      bollingerBands: {
        upper: 64.45,
        middle: 61.35,
        lower: 58.25,
        width: 10.12,
        interpretation: "Neutre, au milieu des bandes",
        description:
          "Le prix évolue près de la bande médiane des Bollinger, suggérant un équilibre entre acheteurs et vendeurs à court terme.",
      },
      supportResistance: {
        supports: [60.5, 59.7, 58.25],
        resistances: [62.3, 64.45, 66.0],
        interpretation: "Consolidation avec biais haussier",
        description:
          "Le titre évolue dans une phase de consolidation avec un support immédiat à 60.50$ et une résistance à 62.30$. La structure reste haussière tant que le support à 59.70$ tient.",
      },
    },
    volumeAnalysis: {
      trend: "Stable",
      interpretation: "Accumulation progressive",
      description:
        "Volume stable avec légère augmentation sur les journées haussières, suggérant une accumulation progressive et un intérêt institutionnel continu.",
    },
    patternRecognition: {
      pattern: "Bullish Flag",
      reliability: "Moyenne",
      target: 66.0,
      description:
        "Formation d'un 'drapeau haussier' après une impulsion, suggérant une probable continuation de la tendance après cette phase de consolidation.",
    },
    analysis:
      "Walmart (WMT) présente un profil technique neutre à court terme mais conserve un biais haussier à moyen et long terme. Le RSI à 54.2 indique un équilibre entre acheteurs et vendeurs avec un léger avantage haussier, tandis que le MACD montre une dynamique positive modérée.\n\nLa structure des moyennes mobiles reste favorable (prix > MA20 > MA50 > MA200), témoignant d'une tendance de fond positive. Le titre est entré dans une phase de consolidation, oscillant entre le support à 60.50$ et la résistance à 62.30$.\n\nLes fondamentaux de Walmart sont solides, avec une résilience remarquable dans un environnement de vente au détail difficile. Le PE de 28.7 est relativement élevé pour le secteur mais reflète la transformation numérique réussie de l'entreprise et sa capacité à maintenir sa croissance malgré sa taille.\n\nStratégie suggérée: Adopter une approche d'accumulation progressive sur les replis vers le support à 60.50$. Alternativement, attendre une cassure confirmée (avec volume) de la résistance à 62.30$ pour initier ou renforcer des positions. Placer un stop-loss sous 59.70$ pour limiter le risque. Objectif de prix à court terme en cas de breakout haussier: 64.45$, objectif à moyen terme: 66.00$. Pour les investisseurs défensifs, WMT offre un bon équilibre entre croissance modérée et stabilité dans un environnement économique incertain.",
  },
}

// Données de secours pour les stocks
const fallbackStockData: Record<string, StockData> = {
  AAPL: {
    symbol: "AAPL",
    name: "Apple Inc.",
    currentPrice: 175.34,
    previousPrice: 173.45,
    change: 1.89,
    changePercent: 1.09,
    lastUpdated: new Date().toISOString(),
  },
  MSFT: {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    currentPrice: 338.11,
    previousPrice: 340.67,
    change: -2.56,
    changePercent: -0.75,
    lastUpdated: new Date().toISOString(),
  },
  GOOGL: {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    currentPrice: 142.56,
    previousPrice: 141.23,
    change: 1.33,
    changePercent: 0.94,
    lastUpdated: new Date().toISOString(),
  },
  AMZN: {
    symbol: "AMZN",
    name: "Amazon.com, Inc.",
    currentPrice: 145.68,
    previousPrice: 144.32,
    change: 1.36,
    changePercent: 0.94,
    lastUpdated: new Date().toISOString(),
  },
  TSLA: {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    currentPrice: 238.45,
    previousPrice: 243.21,
    change: -4.76,
    changePercent: -1.96,
    lastUpdated: new Date().toISOString(),
  },
}

// Fonction pour générer un historique de prix aléatoire
function generateRandomHistory(basePrice: number, days = 30): { timestamp: string; price: number }[] {
  const history = []
  const now = new Date()

  for (let i = days; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Variation aléatoire entre -2% et +2%
    const randomVariation = (Math.random() * 4 - 2) / 100
    const price = basePrice * (1 + randomVariation * i)

    history.push({
      timestamp: date.toISOString(),
      price: Number.parseFloat(price.toFixed(2)),
    })
  }

  return history
}

// Fonction pour obtenir des données en temps réel ou depuis le cache
async function getStockData(symbol: string, forceRefresh = false): Promise<any> {
  try {
    const now = Date.now()
    const cacheEntry = cache[symbol]

    // Vérifier si nous avons des données en cache et si elles sont encore valides
    if (!forceRefresh && cacheEntry && now - cacheEntry.timestamp < CACHE_DURATION) {
      return {
        ...cacheEntry.data,
        history: cacheEntry.history,
        ...(technicalAnalysis[symbol] || {
          shortTerm: { trend: "neutral", percentage: 0 },
          mediumTerm: { trend: "neutral", percentage: 0 },
          longTerm: { trend: "neutral", percentage: 0 },
          analysis: "Aucune analyse disponible pour ce titre.",
          technicalIndicators: {
            rsi: { value: 50, interpretation: "Neutre", description: "Données non disponibles." },
            macd: {
              value: 0,
              signal: 0,
              histogram: 0,
              interpretation: "Neutre",
              description: "Données non disponibles.",
            },
            movingAverages: {
              ma20: 0,
              ma50: 0,
              ma200: 0,
              interpretation: "Neutre",
              description: "Données non disponibles.",
            },
            bollingerBands: {
              upper: 0,
              middle: 0,
              lower: 0,
              width: 0,
              interpretation: "Neutre",
              description: "Données non disponibles.",
            },
            supportResistance: {
              supports: [0, 0, 0],
              resistances: [0, 0, 0],
              interpretation: "Neutre",
              description: "Données non disponibles.",
            },
          },
          volumeAnalysis: { trend: "Stable", interpretation: "Neutre", description: "Données non disponibles." },
          patternRecognition: {
            pattern: "Aucun",
            reliability: "N/A",
            target: 0,
            description: "Données non disponibles.",
          },
          fundamentals: { pe: 0, eps: 0, dividendYield: 0, marketCap: "N/A", beta: 0, avgVolume: "N/A" },
        }),
      }
    }

    // Récupérer de nouvelles données
    let stockData: StockData | null = null
    let history: { timestamp: string; price: number }[] = []

    try {
      stockData = await getStockQuote(symbol)
      history = await getStockHistory(symbol)
    } catch (error) {
      console.error(`Erreur lors de la récupération des données pour ${symbol}:`, error)

      // Utiliser des données de secours si l'API échoue
      stockData = fallbackStockData[symbol] || {
        symbol,
        name: `${symbol} Inc.`,
        currentPrice: 100 + Math.random() * 50,
        previousPrice: 100 + Math.random() * 50,
        change: Math.random() * 5 * (Math.random() > 0.5 ? 1 : -1),
        changePercent: Math.random() * 3 * (Math.random() > 0.5 ? 1 : -1),
        lastUpdated: new Date().toISOString(),
      }

      // Générer un historique aléatoire
      history = generateRandomHistory(stockData.currentPrice)
    }

    if (!stockData) {
      throw new Error(`Données non disponibles pour ${symbol}`)
    }

    // Mettre à jour le cache
    cache[symbol] = {
      data: stockData,
      timestamp: now,
      history,
    }

    // Retourner les données complètes
    return {
      ...stockData,
      history,
      ...(technicalAnalysis[symbol] || {
        shortTerm: { trend: "neutral", percentage: 0 },
        mediumTerm: { trend: "neutral", percentage: 0 },
        longTerm: { trend: "neutral", percentage: 0 },
        analysis: "Aucune analyse disponible pour ce titre.",
        technicalIndicators: {
          rsi: { value: 50, interpretation: "Neutre", description: "Données non disponibles." },
          macd: {
            value: 0,
            signal: 0,
            histogram: 0,
            interpretation: "Neutre",
            description: "Données non disponibles.",
          },
          movingAverages: {
            ma20: 0,
            ma50: 0,
            ma200: 0,
            interpretation: "Neutre",
            description: "Données non disponibles.",
          },
          bollingerBands: {
            upper: 0,
            middle: 0,
            lower: 0,
            width: 0,
            interpretation: "Neutre",
            description: "Données non disponibles.",
          },
          supportResistance: {
            supports: [0, 0, 0],
            resistances: [0, 0, 0],
            interpretation: "Neutre",
            description: "Données non disponibles.",
          },
        },
        volumeAnalysis: { trend: "Stable", interpretation: "Neutre", description: "Données non disponibles." },
        patternRecognition: {
          pattern: "Aucun",
          reliability: "N/A",
          target: 0,
          description: "Données non disponibles.",
        },
        fundamentals: { pe: 0, eps: 0, dividendYield: 0, marketCap: "N/A", beta: 0, avgVolume: "N/A" },
      }),
    }
  } catch (error) {
    console.error(`Erreur dans getStockData pour ${symbol}:`, error)

    // Retourner des données de secours en cas d'erreur
    const fallbackData = fallbackStockData[symbol] || {
      symbol,
      name: `${symbol} Inc.`,
      currentPrice: 100 + Math.random() * 50,
      previousPrice: 100 + Math.random() * 50,
      change: Math.random() * 5 * (Math.random() > 0.5 ? 1 : -1),
      changePercent: Math.random() * 3 * (Math.random() > 0.5 ? 1 : -1),
      lastUpdated: new Date().toISOString(),
    }

    // Générer des données techniques aléatoires
    const randomRSI = 30 + Math.random() * 40
    const randomMACD = (Math.random() * 2 - 1) * 2
    const randomSignal = randomMACD * (0.8 + Math.random() * 0.4)
    const randomHistogram = randomMACD - randomSignal
    const basePrice = fallbackData.currentPrice
    const randomMA20 = basePrice * (0.95 + Math.random() * 0.1)
    const randomMA50 = randomMA20 * (0.95 + Math.random() * 0.1)
    const randomMA200 = randomMA50 * (0.95 + Math.random() * 0.1)
    const randomBBWidth = 5 + Math.random() * 10
    const randomBBMiddle = basePrice
    const randomBBUpper = randomBBMiddle + (randomBBMiddle * randomBBWidth) / 200
    const randomBBLower = randomBBMiddle - (randomBBMiddle * randomBBWidth) / 200
    const randomSupports = [basePrice * 0.95, basePrice * 0.92, basePrice * 0.88]
    const randomResistances = [basePrice * 1.05, basePrice * 1.08, basePrice * 1.12]

    return {
      ...fallbackData,
      history: generateRandomHistory(fallbackData.currentPrice),
      shortTerm: { trend: Math.random() > 0.5 ? "bullish" : "bearish", percentage: Math.random() * 5 },
      mediumTerm: { trend: Math.random() > 0.5 ? "bullish" : "bearish", percentage: Math.random() * 8 },
      longTerm: { trend: Math.random() > 0.5 ? "bullish" : "neutral", percentage: Math.random() * 12 },
      fundamentals: {
        pe: 15 + Math.random() * 30,
        eps: 1 + Math.random() * 10,
        dividendYield: Math.random() * 3,
        marketCap: `${Math.floor(100 + Math.random() * 900)}B`,
        beta: 0.5 + Math.random() * 1.5,
        avgVolume: `${Math.floor(1 + Math.random() * 50)}M`,
      },
      technicalIndicators: {
        rsi: {
          value: randomRSI,
          interpretation: randomRSI > 70 ? "Suracheté" : randomRSI < 30 ? "Survendu" : "Neutre",
          description: `L'indice de force relative (RSI) est à ${randomRSI.toFixed(1)}, ${randomRSI > 70 ? "indiquant des conditions de surachat" : randomRSI < 30 ? "indiquant des conditions de survente" : "indiquant un équilibre entre acheteurs et vendeurs"}.`,
        },
        macd: {
          value: randomMACD,
          signal: randomSignal,
          histogram: randomHistogram,
          interpretation: randomHistogram > 0 ? "Haussier" : "Baissier",
          description: `Le MACD (${randomMACD.toFixed(2)}) est ${randomMACD > randomSignal ? "au-dessus" : "en-dessous"} de sa ligne de signal (${randomSignal.toFixed(2)}) avec un histogramme ${randomHistogram > 0 ? "positif" : "négatif"}, ${randomHistogram > 0 ? "suggérant une dynamique haussière" : "suggérant une dynamique baissière"}.`,
        },
        movingAverages: {
          ma20: randomMA20,
          ma50: randomMA50,
          ma200: randomMA200,
          interpretation:
            basePrice > randomMA20 && randomMA20 > randomMA50 && randomMA50 > randomMA200
              ? "Haussier"
              : basePrice < randomMA20 && randomMA20 < randomMA50 && randomMA50 < randomMA200
                ? "Baissier"
                : "Mixte",
          description: `Le prix ${basePrice > randomMA20 ? "est au-dessus" : "est en-dessous"} de la MA20 (${randomMA20.toFixed(2)}), ${basePrice > randomMA50 ? "au-dessus" : "en-dessous"} de la MA50 (${randomMA50.toFixed(2)}) et ${basePrice > randomMA200 ? "au-dessus" : "en-dessous"} de la MA200 (${randomMA200.toFixed(2)}), ${basePrice > randomMA20 && randomMA20 > randomMA50 && randomMA50 > randomMA200 ? "formant une structure haussière" : basePrice < randomMA20 && randomMA20 < randomMA50 && randomMA50 < randomMA200 ? "formant une structure baissière" : "formant une structure mixte"}.`,
        },
        bollingerBands: {
          upper: randomBBUpper,
          middle: randomBBMiddle,
          lower: randomBBLower,
          width: randomBBWidth,
          interpretation: basePrice > randomBBUpper ? "Suracheté" : basePrice < randomBBLower ? "Survendu" : "Neutre",
          description: `Le prix évolue ${basePrice > randomBBUpper ? "au-dessus de la bande supérieure" : basePrice < randomBBLower ? "sous la bande inférieure" : "entre les bandes"} de Bollinger, ${basePrice > randomBBUpper ? "indiquant un possible surachat" : basePrice < randomBBLower ? "indiquant un possible survente" : "suggérant un équilibre entre acheteurs et vendeurs"}.`,
        },
        supportResistance: {
          supports: randomSupports,
          resistances: randomResistances,
          interpretation: "Neutre",
          description: `Le titre évolue avec des supports à ${randomSupports.map((s) => s.toFixed(2)).join("$, ")}$ et des résistances à ${randomResistances.map((r) => r.toFixed(2)).join("$, ")}$.`,
        },
      },
      volumeAnalysis: {
        trend: Math.random() > 0.5 ? "En hausse" : Math.random() > 0.5 ? "En baisse" : "Stable",
        interpretation: Math.random() > 0.5 ? "Confirmation de tendance" : "Divergence",
        description:
          "Données générées automatiquement. Les données réelles de volume ne sont pas disponibles actuellement.",
      },
      patternRecognition: {
        pattern: [
          "Double Top",
          "Double Bottom",
          "Head and Shoulders",
          "Inverse Head and Shoulders",
          "Triangle",
          "Rectangle",
          "Flag",
          "Pennant",
        ][Math.floor(Math.random() * 8)],
        reliability: Math.random() > 0.7 ? "Élevée" : Math.random() > 0.4 ? "Moyenne" : "Faible",
        target: basePrice * (0.9 + Math.random() * 0.3),
        description:
          "Données générées automatiquement. L'analyse de figures chartistes réelle n'est pas disponible actuellement.",
      },
      analysis:
        "Données de secours générées automatiquement. L'analyse technique détaillée n'est pas disponible actuellement. Nous vous recommandons de consulter des sources spécialisées pour une analyse approfondie avant de prendre des décisions d'investissement.",
    }
  }
}

export async function GET(request: Request) {
  try {
    // Obtenir la session actuelle
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")
    const refresh = searchParams.get("refresh") === "true"

    if (symbol) {
      try {
        // Récupérer les données pour un symbole spécifique
        const stockData = await getStockData(symbol, refresh)
        return NextResponse.json(stockData)
      } catch (error) {
        console.error(`Erreur lors de la récupération des données pour ${symbol}:`, error)

        // Retourner des données de secours en cas d'erreur
        const fallbackData = fallbackStockData[symbol] || {
          symbol,
          name: `${symbol} Inc.`,
          currentPrice: 100 + Math.random() * 50,
          previousPrice: 100 + Math.random() * 50,
          change: Math.random() * 5 * (Math.random() > 0.5 ? 1 : -1),
          changePercent: Math.random() * 3 * (Math.random() > 0.5 ? 1 : -1),
          lastUpdated: new Date().toISOString(),
          history: generateRandomHistory(100 + Math.random() * 50),
          shortTerm: { trend: Math.random() > 0.5 ? "bullish" : "bearish", percentage: Math.random() * 5 },
          mediumTerm: { trend: Math.random() > 0.5 ? "bullish" : "bearish", percentage: Math.random() * 8 },
          longTerm: { trend: Math.random() > 0.5 ? "bullish" : "neutral", percentage: Math.random() * 12 },
          analysis:
            "Données de secours générées automatiquement. Les données réelles ne sont pas disponibles actuellement.",
        }

        return NextResponse.json(fallbackData)
      }
    } else {
      try {
        // Récupérer les données pour plusieurs symboles populaires
        const stocks = await getMultipleStocks(popularStocks)

        // Ajouter les tendances à court terme
        const enhancedStocks = stocks.map((stock) => ({
          ...stock,
          shortTermTrend: technicalAnalysis[stock.symbol]?.shortTerm?.trend || "neutral",
        }))

        return NextResponse.json(enhancedStocks)
      } catch (error) {
        console.error("Erreur lors de la récupération des prédictions multiples:", error)

        // Retourner des données de secours en cas d'erreur
        const fallbackStocks = popularStocks.map((symbol) => ({
          ...(fallbackStockData[symbol] || {
            symbol,
            name: `${symbol} Inc.`,
            currentPrice: 100 + Math.random() * 50,
            previousPrice: 100 + Math.random() * 50,
            change: Math.random() * 5 * (Math.random() > 0.5 ? 1 : -1),
            changePercent: Math.random() * 3 * (Math.random() > 0.5 ? 1 : -1),
            lastUpdated: new Date().toISOString(),
          }),
          shortTermTrend: Math.random() > 0.5 ? "bullish" : Math.random() > 0.5 ? "bearish" : "neutral",
        }))

        return NextResponse.json(fallbackStocks)
      }
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des prédictions:", error)

    // Retourner des données de secours en cas d'erreur
    const fallbackStocks = popularStocks.map((symbol) => ({
      ...(fallbackStockData[symbol] || {
        symbol,
        name: `${symbol} Inc.`,
        currentPrice: 100 + Math.random() * 50,
        previousPrice: 100 + Math.random() * 50,
        change: Math.random() * 5 * (Math.random() > 0.5 ? 1 : -1),
        changePercent: Math.random() * 3 * (Math.random() > 0.5 ? 1 : -1),
        lastUpdated: new Date().toISOString(),
      }),
      shortTermTrend: Math.random() > 0.5 ? "bullish" : Math.random() > 0.5 ? "bearish" : "neutral",
    }))

    return NextResponse.json(fallbackStocks)
  }
}

export async function POST(request: Request) {
  try {
    // Obtenir la session actuelle
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    // Récupérer les données de la prédiction
    const body = await request.json()
    const { symbol, portfolioId, amount } = body

    if (!symbol || !portfolioId || !amount) {
      return NextResponse.json(
        {
          error: "Données manquantes",
          details: "Le symbole, l'ID du portfolio et le montant sont requis",
        },
        { status: 400 },
      )
    }

    try {
      // Récupérer les données actuelles de l'action
      const stockData = await getStockData(symbol)

      // Simuler l'ajout de l'action au portfolio
      return NextResponse.json({
        success: true,
        message: `${symbol} ajouté au portfolio`,
        details: {
          symbol,
          price: stockData.currentPrice,
          amount: Number.parseFloat(amount),
          totalValue: stockData.currentPrice * Number.parseFloat(amount),
          portfolioId,
        },
      })
    } catch (error) {
      console.error(`Erreur lors de l'ajout de la prédiction pour ${symbol}:`, error)

      // Utiliser des données de secours
      const fallbackPrice = 100 + Math.random() * 50

      return NextResponse.json({
        success: true,
        message: `${symbol} ajouté au portfolio (données de secours)`,
        details: {
          symbol,
          price: fallbackPrice,
          amount: Number.parseFloat(amount),
          totalValue: fallbackPrice * Number.parseFloat(amount),
          portfolioId,
        },
      })
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout de la prédiction:", error)
    return NextResponse.json(
      {
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}
