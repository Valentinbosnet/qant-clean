export const dynamic = "force-dynamic"
export const generateStaticParams = () => {
  return []
}

export default function MarketPredictionsStaticPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "3rem",
          }}
        >
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              color: "#1f2937",
              marginBottom: "1rem",
            }}
          >
            Prédictions du Marché
          </h1>
          <p
            style={{
              fontSize: "1.125rem",
              color: "#6b7280",
              marginBottom: "2rem",
            }}
          >
            Analyses et prédictions IA pour les actions du marché
          </p>

          <div
            style={{
              display: "inline-block",
              padding: "1rem 2rem",
              backgroundColor: "#f3f4f6",
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  border: "3px solid #e5e7eb",
                  borderTop: "3px solid #3b82f6",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              ></div>
              <span style={{ marginLeft: "0.5rem", color: "#374151" }}>Chargement des prédictions...</span>
            </div>
            <p
              style={{
                fontSize: "0.875rem",
                color: "#6b7280",
                margin: 0,
              }}
            >
              Les prédictions du marché seront disponibles après le déploiement
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "1.5rem",
            marginTop: "2rem",
          }}
        >
          {/* Placeholder pour les prédictions */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                padding: "1.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "20px",
                    backgroundColor: "#e5e7eb",
                    borderRadius: "0.25rem",
                  }}
                ></div>
                <div
                  style={{
                    width: "80px",
                    height: "20px",
                    backgroundColor: "#e5e7eb",
                    borderRadius: "0.25rem",
                  }}
                ></div>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "100px",
                  backgroundColor: "#e5e7eb",
                  borderRadius: "0.25rem",
                  marginBottom: "1rem",
                }}
              ></div>
              <div
                style={{
                  width: "70%",
                  height: "16px",
                  backgroundColor: "#e5e7eb",
                  borderRadius: "0.25rem",
                  marginBottom: "0.5rem",
                }}
              ></div>
              <div
                style={{
                  width: "50%",
                  height: "16px",
                  backgroundColor: "#e5e7eb",
                  borderRadius: "0.25rem",
                }}
              ></div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "3rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "0.5rem",
              padding: "1rem",
              display: "inline-block",
            }}
          >
            <h4
              style={{
                fontSize: "1rem",
                fontWeight: "600",
                color: "#1e40af",
                marginBottom: "0.5rem",
              }}
            >
              Fonctionnalités à venir
            </h4>
            <ul
              style={{
                textAlign: "left",
                color: "#1e40af",
                fontSize: "0.875rem",
                margin: 0,
                paddingLeft: "1rem",
              }}
            >
              <li>Prédictions IA en temps réel</li>
              <li>Analyse technique avancée</li>
              <li>Filtres par secteur</li>
              <li>Comparaison de performances</li>
              <li>Alertes de prédictions</li>
            </ul>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `,
        }}
      />
    </div>
  )
}
