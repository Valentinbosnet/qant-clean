export const dynamic = "force-dynamic"
export const generateStaticParams = () => {
  return []
}

export default function TestIAPlusStaticPage() {
  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        padding: "2rem",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          marginBottom: "1rem",
          color: "#333",
        }}
      >
        Test des Prédictions IA+
      </h1>

      <div
        style={{
          backgroundColor: "#f9f9f9",
          border: "1px solid #eaeaea",
          borderRadius: "8px",
          padding: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <p
          style={{
            fontSize: "1rem",
            color: "#666",
            marginBottom: "1rem",
          }}
        >
          Cette page est en cours de chargement. Les fonctionnalités de test IA+ seront disponibles après le déploiement
          complet.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #3498db",
              borderRadius: "50%",
              animation: "spin 2s linear infinite",
            }}
          ></div>

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

        <p
          style={{
            fontSize: "0.875rem",
            color: "#888",
            textAlign: "center",
          }}
        >
          Veuillez patienter ou revenir plus tard pour tester les prédictions IA+.
        </p>
      </div>

      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #eaeaea",
          borderRadius: "8px",
          padding: "1.5rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            color: "#333",
          }}
        >
          Fonctionnalités à venir
        </h2>

        <ul
          style={{
            listStyleType: "disc",
            paddingLeft: "1.5rem",
            color: "#555",
          }}
        >
          <li style={{ marginBottom: "0.5rem" }}>Prédictions basées sur l'IA pour les symboles boursiers</li>
          <li style={{ marginBottom: "0.5rem" }}>Analyse des tendances du marché</li>
          <li style={{ marginBottom: "0.5rem" }}>Recommandations d'investissement personnalisées</li>
          <li style={{ marginBottom: "0.5rem" }}>Visualisations interactives des données</li>
          <li style={{ marginBottom: "0.5rem" }}>Alertes de marché en temps réel</li>
        </ul>
      </div>
    </div>
  )
}
