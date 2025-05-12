/**
 * Classification des secteurs d'activité pour les actions
 */

// Types de secteurs principaux
export type SectorType =
  | "technology"
  | "healthcare"
  | "financial"
  | "consumer"
  | "industrial"
  | "energy"
  | "utilities"
  | "materials"
  | "communication"
  | "real_estate"
  | "unknown"

// Interface pour les informations de secteur
export interface SectorInfo {
  sector: SectorType
  subSector?: string
  description: string
}

// Mapping des symboles connus vers leurs secteurs
// Cette liste peut être étendue avec plus de symboles
const knownSymbolSectors: Record<string, SectorInfo> = {
  // Technologie
  AAPL: { sector: "technology", subSector: "consumer_electronics", description: "Produits électroniques et services" },
  MSFT: { sector: "technology", subSector: "software", description: "Logiciels et services cloud" },
  GOOGL: { sector: "technology", subSector: "internet", description: "Services Internet et publicité" },
  GOOG: { sector: "technology", subSector: "internet", description: "Services Internet et publicité" },
  AMZN: { sector: "technology", subSector: "e_commerce", description: "Commerce électronique et cloud computing" },
  META: { sector: "technology", subSector: "social_media", description: "Réseaux sociaux et publicité" },
  NVDA: { sector: "technology", subSector: "semiconductors", description: "Semi-conducteurs et IA" },
  INTC: { sector: "technology", subSector: "semiconductors", description: "Semi-conducteurs" },
  AMD: { sector: "technology", subSector: "semiconductors", description: "Semi-conducteurs" },
  TSLA: { sector: "technology", subSector: "automotive", description: "Véhicules électriques et énergie" },
  CRM: { sector: "technology", subSector: "software", description: "Logiciels CRM" },
  ADBE: { sector: "technology", subSector: "software", description: "Logiciels créatifs" },
  ORCL: { sector: "technology", subSector: "software", description: "Logiciels d'entreprise et bases de données" },
  CSCO: { sector: "technology", subSector: "networking", description: "Équipements réseau" },
  IBM: { sector: "technology", subSector: "it_services", description: "Services informatiques et cloud" },

  // Santé
  JNJ: { sector: "healthcare", subSector: "pharmaceuticals", description: "Produits pharmaceutiques et médicaux" },
  PFE: { sector: "healthcare", subSector: "pharmaceuticals", description: "Produits pharmaceutiques" },
  MRK: { sector: "healthcare", subSector: "pharmaceuticals", description: "Produits pharmaceutiques" },
  ABBV: { sector: "healthcare", subSector: "pharmaceuticals", description: "Produits biopharmaceutiques" },
  UNH: { sector: "healthcare", subSector: "health_insurance", description: "Assurance santé et services" },
  ABT: { sector: "healthcare", subSector: "medical_devices", description: "Dispositifs médicaux et diagnostics" },
  TMO: { sector: "healthcare", subSector: "life_sciences", description: "Équipements scientifiques" },
  MDT: { sector: "healthcare", subSector: "medical_devices", description: "Dispositifs médicaux" },
  AMGN: { sector: "healthcare", subSector: "biotechnology", description: "Biotechnologie" },
  GILD: { sector: "healthcare", subSector: "biotechnology", description: "Biotechnologie" },

  // Finance
  JPM: { sector: "financial", subSector: "banking", description: "Services bancaires et financiers" },
  BAC: { sector: "financial", subSector: "banking", description: "Services bancaires" },
  WFC: { sector: "financial", subSector: "banking", description: "Services bancaires" },
  C: { sector: "financial", subSector: "banking", description: "Services bancaires internationaux" },
  GS: { sector: "financial", subSector: "investment_banking", description: "Banque d'investissement" },
  MS: { sector: "financial", subSector: "investment_banking", description: "Banque d'investissement" },
  V: { sector: "financial", subSector: "payment", description: "Services de paiement" },
  MA: { sector: "financial", subSector: "payment", description: "Services de paiement" },
  AXP: { sector: "financial", subSector: "payment", description: "Services de paiement et crédit" },
  BLK: { sector: "financial", subSector: "asset_management", description: "Gestion d'actifs" },

  // Consommation
  WMT: { sector: "consumer", subSector: "retail", description: "Commerce de détail" },
  PG: { sector: "consumer", subSector: "consumer_goods", description: "Produits de consommation" },
  KO: { sector: "consumer", subSector: "beverages", description: "Boissons" },
  PEP: { sector: "consumer", subSector: "beverages", description: "Boissons et snacks" },
  MCD: { sector: "consumer", subSector: "restaurants", description: "Restauration rapide" },
  SBUX: { sector: "consumer", subSector: "restaurants", description: "Cafés" },
  NKE: { sector: "consumer", subSector: "apparel", description: "Vêtements et chaussures" },
  HD: { sector: "consumer", subSector: "home_improvement", description: "Amélioration de l'habitat" },
  TGT: { sector: "consumer", subSector: "retail", description: "Commerce de détail" },
  COST: { sector: "consumer", subSector: "retail", description: "Commerce de détail en gros" },

  // Industrie
  BA: { sector: "industrial", subSector: "aerospace", description: "Aérospatiale et défense" },
  GE: { sector: "industrial", subSector: "conglomerate", description: "Conglomérat industriel" },
  HON: { sector: "industrial", subSector: "conglomerate", description: "Conglomérat industriel" },
  MMM: { sector: "industrial", subSector: "conglomerate", description: "Conglomérat industriel" },
  CAT: { sector: "industrial", subSector: "machinery", description: "Machines et équipements" },
  DE: { sector: "industrial", subSector: "machinery", description: "Machines agricoles" },
  UPS: { sector: "industrial", subSector: "logistics", description: "Logistique et livraison" },
  FDX: { sector: "industrial", subSector: "logistics", description: "Logistique et livraison" },
  LMT: { sector: "industrial", subSector: "defense", description: "Défense et aérospatiale" },
  RTX: { sector: "industrial", subSector: "defense", description: "Défense et aérospatiale" },

  // Énergie
  XOM: { sector: "energy", subSector: "oil_gas", description: "Pétrole et gaz" },
  CVX: { sector: "energy", subSector: "oil_gas", description: "Pétrole et gaz" },
  COP: { sector: "energy", subSector: "oil_gas", description: "Pétrole et gaz" },
  EOG: { sector: "energy", subSector: "oil_gas", description: "Pétrole et gaz" },
  SLB: { sector: "energy", subSector: "oil_services", description: "Services pétroliers" },
  PSX: { sector: "energy", subSector: "refining", description: "Raffinage et marketing" },
  VLO: { sector: "energy", subSector: "refining", description: "Raffinage et marketing" },
  OXY: { sector: "energy", subSector: "oil_gas", description: "Pétrole et gaz" },
  BP: { sector: "energy", subSector: "oil_gas", description: "Pétrole et gaz" },
  SHEL: { sector: "energy", subSector: "oil_gas", description: "Pétrole et gaz" },

  // Services publics
  NEE: { sector: "utilities", subSector: "electric", description: "Électricité" },
  DUK: { sector: "utilities", subSector: "electric", description: "Électricité" },
  SO: { sector: "utilities", subSector: "electric", description: "Électricité" },
  D: { sector: "utilities", subSector: "electric", description: "Électricité" },
  AEP: { sector: "utilities", subSector: "electric", description: "Électricité" },
  EXC: { sector: "utilities", subSector: "electric", description: "Électricité" },
  PCG: { sector: "utilities", subSector: "electric", description: "Électricité et gaz" },
  SRE: { sector: "utilities", subSector: "electric", description: "Électricité et gaz" },
  WEC: { sector: "utilities", subSector: "electric", description: "Électricité et gaz" },
  ES: { sector: "utilities", subSector: "electric", description: "Électricité et gaz" },

  // Matériaux
  LIN: { sector: "materials", subSector: "chemicals", description: "Produits chimiques industriels" },
  APD: { sector: "materials", subSector: "chemicals", description: "Produits chimiques industriels" },
  DD: { sector: "materials", subSector: "chemicals", description: "Produits chimiques" },
  DOW: { sector: "materials", subSector: "chemicals", description: "Produits chimiques" },
  FCX: { sector: "materials", subSector: "mining", description: "Exploitation minière" },
  NEM: { sector: "materials", subSector: "mining", description: "Exploitation minière (or)" },
  NUE: { sector: "materials", subSector: "steel", description: "Acier" },
  IP: { sector: "materials", subSector: "paper", description: "Papier et emballage" },
  BLL: { sector: "materials", subSector: "packaging", description: "Emballage" },
  ECL: { sector: "materials", subSector: "chemicals", description: "Produits chimiques spécialisés" },

  // Communication
  T: { sector: "communication", subSector: "telecom", description: "Télécommunications" },
  VZ: { sector: "communication", subSector: "telecom", description: "Télécommunications" },
  TMUS: { sector: "communication", subSector: "telecom", description: "Télécommunications" },
  CMCSA: { sector: "communication", subSector: "media", description: "Médias et télécommunications" },
  DIS: { sector: "communication", subSector: "media", description: "Médias et divertissement" },
  NFLX: { sector: "communication", subSector: "media", description: "Streaming et divertissement" },
  ATVI: { sector: "communication", subSector: "gaming", description: "Jeux vidéo" },
  EA: { sector: "communication", subSector: "gaming", description: "Jeux vidéo" },
  TTWO: { sector: "communication", subSector: "gaming", description: "Jeux vidéo" },
  CHTR: { sector: "communication", subSector: "telecom", description: "Télécommunications par câble" },

  // Immobilier
  AMT: { sector: "real_estate", subSector: "reit", description: "REIT (tours de télécommunication)" },
  PLD: { sector: "real_estate", subSector: "reit", description: "REIT (logistique)" },
  CCI: { sector: "real_estate", subSector: "reit", description: "REIT (tours de télécommunication)" },
  EQIX: { sector: "real_estate", subSector: "reit", description: "REIT (centres de données)" },
  SPG: { sector: "real_estate", subSector: "reit", description: "REIT (centres commerciaux)" },
  AVB: { sector: "real_estate", subSector: "reit", description: "REIT (résidentiel)" },
  EQR: { sector: "real_estate", subSector: "reit", description: "REIT (résidentiel)" },
  O: { sector: "real_estate", subSector: "reit", description: "REIT (commerce de détail)" },
  WELL: { sector: "real_estate", subSector: "reit", description: "REIT (santé)" },
  DLR: { sector: "real_estate", subSector: "reit", description: "REIT (centres de données)" },
}

/**
 * Obtient les informations de secteur pour un symbole boursier
 * @param symbol Symbole boursier
 * @returns Informations sur le secteur
 */
export function getSectorInfo(symbol: string): SectorInfo {
  const normalizedSymbol = symbol.toUpperCase()

  if (normalizedSymbol in knownSymbolSectors) {
    return knownSymbolSectors[normalizedSymbol]
  }

  // Si le symbole n'est pas dans notre base de données, on retourne "unknown"
  return {
    sector: "unknown",
    description: "Secteur inconnu",
  }
}

/**
 * Vérifie si un symbole appartient à un secteur spécifique
 * @param symbol Symbole boursier
 * @param sector Secteur à vérifier
 * @returns true si le symbole appartient au secteur spécifié
 */
export function isInSector(symbol: string, sector: SectorType): boolean {
  const info = getSectorInfo(symbol)
  return info.sector === sector
}

/**
 * Obtient une description du secteur pour un symbole
 * @param symbol Symbole boursier
 * @returns Description du secteur
 */
export function getSectorDescription(symbol: string): string {
  const info = getSectorInfo(symbol)
  return `${info.description} (${getSectorName(info.sector)}${info.subSector ? `, ${getSubSectorName(info.subSector)}` : ""})`
}

/**
 * Obtient le nom lisible d'un secteur
 * @param sector Type de secteur
 * @returns Nom du secteur
 */
export function getSectorName(sector: SectorType): string {
  const sectorNames: Record<SectorType, string> = {
    technology: "Technologie",
    healthcare: "Santé",
    financial: "Finance",
    consumer: "Consommation",
    industrial: "Industrie",
    energy: "Énergie",
    utilities: "Services publics",
    materials: "Matériaux",
    communication: "Communication",
    real_estate: "Immobilier",
    unknown: "Inconnu",
  }

  return sectorNames[sector]
}

/**
 * Obtient le nom lisible d'un sous-secteur
 * @param subSector Type de sous-secteur
 * @returns Nom du sous-secteur
 */
export function getSubSectorName(subSector: string): string {
  const subSectorNames: Record<string, string> = {
    // Technologie
    consumer_electronics: "Électronique grand public",
    software: "Logiciels",
    internet: "Internet",
    e_commerce: "Commerce électronique",
    social_media: "Réseaux sociaux",
    semiconductors: "Semi-conducteurs",
    automotive: "Automobile",
    networking: "Réseaux",
    it_services: "Services informatiques",

    // Santé
    pharmaceuticals: "Produits pharmaceutiques",
    health_insurance: "Assurance santé",
    medical_devices: "Dispositifs médicaux",
    life_sciences: "Sciences de la vie",
    biotechnology: "Biotechnologie",

    // Finance
    banking: "Banque",
    investment_banking: "Banque d'investissement",
    payment: "Paiement",
    asset_management: "Gestion d'actifs",

    // Consommation
    retail: "Commerce de détail",
    consumer_goods: "Biens de consommation",
    beverages: "Boissons",
    restaurants: "Restauration",
    apparel: "Habillement",
    home_improvement: "Amélioration de l'habitat",

    // Industrie
    aerospace: "Aérospatiale",
    conglomerate: "Conglomérat",
    machinery: "Machines",
    logistics: "Logistique",
    defense: "Défense",

    // Énergie
    oil_gas: "Pétrole et gaz",
    oil_services: "Services pétroliers",
    refining: "Raffinage",

    // Services publics
    electric: "Électricité",

    // Matériaux
    chemicals: "Produits chimiques",
    mining: "Exploitation minière",
    steel: "Acier",
    paper: "Papier",
    packaging: "Emballage",

    // Communication
    telecom: "Télécommunications",
    media: "Médias",
    gaming: "Jeux vidéo",

    // Immobilier
    reit: "REIT",
  }

  return subSectorNames[subSector] || subSector
}
