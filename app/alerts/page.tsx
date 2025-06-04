export const dynamic = "force-dynamic"
export const generateStaticParams = () => {
  return []
}

export default function AlertsStaticPage() {
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
            Alertes de Prix
          </h1>
          <p
            style={{
              fontSize: "1.125rem",
              color: "#6b7280",
              marginBottom: "2rem",
            }}
          >
            Configurez des alertes pour être notifié des mouvements de prix importants
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
              <span style={{ marginLeft: "0.5rem", color: "#374151" }}>Chargement des alertes...</span>
            </div>
            <p
              style={{
                fontSize: "0.875rem",
                color: "#6b7280",
                margin: 0,
              }}
            >
              Les fonctionnalités d'alertes seront disponibles après le déploiement
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
          {/* Placeholder pour les alertes actives */}
          <div
            style={{
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
              padding: "1.5rem",
            }}
          >
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "1rem",
              }}
            >
              Alertes Actives
            </h3>
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "#6b7280",
              }}
            >
              <p>Aucune alerte active</p>
              <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
                Créez votre première alerte après le déploiement
              </p>
            </div>
          </div>

          {/* Placeholder pour l'historique */}
          <div
            style={{
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
              padding: "1.5rem",
            }}
          >
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "1rem",
              }}
            >
              Historique des Alertes
            </h3>
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "#6b7280",
              }}
            >
              <p>Aucun historique disponible</p>
              <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
                L'historique apparaîtra ici une fois les alertes configurées
              </p>
            </div>
          </div>
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
              <li>Alertes de prix en temps réel</li>
              <li>Notifications par email</li>
              <li>Alertes basées sur les volumes</li>
              <li>Alertes de prédictions IA</li>
              <li>Gestion avancée des alertes</li>
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
