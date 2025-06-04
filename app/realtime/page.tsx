export const dynamic = "force-dynamic"
export const generateStaticParams = () => {
  return []
}

export default function RealtimeStaticPage() {
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
            Données en Temps Réel
          </h1>
          <p
            style={{
              fontSize: "1.125rem",
              color: "#6b7280",
              marginBottom: "2rem",
            }}
          >
            Suivez les données de marché en temps réel
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
              <span style={{ marginLeft: "0.5rem", color: "#374151" }}>Connexion aux données en temps réel...</span>
            </div>
            <p
              style={{
                fontSize: "0.875rem",
                color: "#6b7280",
                margin: 0,
              }}
            >
              Les données en temps réel seront disponibles après le déploiement
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
            marginTop: "2rem",
          }}
        >
          {/* Placeholder pour les données en temps réel */}
          {[1, 2, 3, 4].map((i) => (
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
                    width: "8px",
                    height: "8px",
                    backgroundColor: "#10b981",
                    borderRadius: "50%",
                  }}
                ></div>
              </div>
              <div
                style={{
                  width: "80px",
                  height: "24px",
                  backgroundColor: "#e5e7eb",
                  borderRadius: "0.25rem",
                  marginBottom: "0.5rem",
                }}
              ></div>
              <div
                style={{
                  width: "60px",
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
              <li>Prix en temps réel</li>
              <li>Volumes de trading</li>
              <li>Indicateurs techniques</li>
              <li>Alertes instantanées</li>
              <li>Graphiques interactifs</li>
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
