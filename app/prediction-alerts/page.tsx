export const dynamic = "force-dynamic"
export const generateStaticParams = () => {
  return []
}

export default function PredictionAlertsStaticPage() {
  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <a
            href="/market-predictions"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "0.375rem",
              marginRight: "0.5rem",
              color: "#6b7280",
              textDecoration: "none",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </a>
          <h1
            style={{
              fontSize: "1.875rem",
              fontWeight: "bold",
              margin: 0,
            }}
          >
            Alertes de prédiction
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: "0.625rem",
                top: "0.625rem",
                color: "#6b7280",
                width: "1rem",
                height: "1rem",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <input
              type="search"
              placeholder="Rechercher..."
              style={{
                paddingLeft: "2rem",
                width: "16rem",
                height: "2.5rem",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
                backgroundColor: "transparent",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                color: "#6b7280",
                width: "1rem",
                height: "1rem",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            </div>
            <select
              style={{
                backgroundColor: "transparent",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                padding: "0.5rem 0.75rem",
                fontSize: "0.875rem",
              }}
            >
              <option value="all">Tous les types</option>
              <option value="price-target">Objectif de prix</option>
              <option value="trend-change">Changement de tendance</option>
              <option value="volatility">Volatilité</option>
              <option value="confidence">Confiance</option>
              <option value="sector-trend">Tendance sectorielle</option>
              <option value="custom">Personnalisée</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            marginBottom: "1rem",
          }}
        >
          <button
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#f9fafb",
              border: "1px solid #d1d5db",
              borderRadius: "0.375rem 0 0 0.375rem",
              fontSize: "0.875rem",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Alertes actives{" "}
            <span
              style={{
                display: "inline-block",
                backgroundColor: "#e5e7eb",
                borderRadius: "9999px",
                padding: "0.125rem 0.5rem",
                marginLeft: "0.25rem",
                fontSize: "0.75rem",
              }}
            >
              0
            </span>
          </button>
          <button
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "transparent",
              border: "1px solid #d1d5db",
              borderLeft: "none",
              borderRadius: "0 0.375rem 0.375rem 0",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Alertes déclenchées{" "}
            <span
              style={{
                display: "inline-block",
                backgroundColor: "#e5e7eb",
                borderRadius: "9999px",
                padding: "0.125rem 0.5rem",
                marginLeft: "0.25rem",
                fontSize: "0.75rem",
              }}
            >
              0
            </span>
          </button>
        </div>

        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "0.5rem",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
            backgroundColor: "white",
          }}
        >
          <div
            style={{
              padding: "1.5rem",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: "bold",
                margin: 0,
              }}
            >
              Alertes actives
            </h2>
            <p
              style={{
                color: "#6b7280",
                margin: "0.25rem 0 0 0",
                fontSize: "0.875rem",
              }}
            >
              0 alertes en attente de déclenchement
            </p>
          </div>
          <div
            style={{
              padding: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem 0",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  marginBottom: "0.5rem",
                  color: "#6b7280",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p
                style={{
                  color: "#6b7280",
                  margin: 0,
                }}
              >
                Aucune alerte active
              </p>
              <a
                href="/market-predictions"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0.375rem 0.75rem",
                  marginTop: "1rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginRight: "0.5rem" }}
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  <path d="M2 8c0-2.2.7-4.3 2-6" />
                  <path d="M22 8a10 10 0 0 0-2-6" />
                </svg>
                Créer une alerte
              </a>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          border: "1px solid #e5e7eb",
          borderRadius: "0.5rem",
          backgroundColor: "#f9fafb",
        }}
      >
        <p style={{ margin: 0, textAlign: "center" }}>
          <strong>Note:</strong> Cette page est en cours de chargement. La fonctionnalité complète sera disponible après
          le déploiement.
        </p>
      </div>
    </div>
  )
}
