export const dynamic = "force-dynamic"
export const generateStaticParams = () => {
  return []
}

export default function StorageStaticPage() {
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
            Stockage
          </h1>
          <p
            style={{
              fontSize: "1.125rem",
              color: "#6b7280",
              marginBottom: "2rem",
            }}
          >
            Gérez vos fichiers et documents
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
            <p
              style={{
                fontSize: "0.875rem",
                color: "#6b7280",
                margin: 0,
              }}
            >
              Connectez-vous pour accéder à votre espace de stockage
            </p>
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            backgroundColor: "#f9fafb",
            borderRadius: "0.5rem",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              fontSize: "3rem",
              marginBottom: "1rem",
            }}
          >
            📁
          </div>
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              color: "#1f2937",
              marginBottom: "0.5rem",
            }}
          >
            Espace de stockage vide
          </h3>
          <p
            style={{
              color: "#6b7280",
              marginBottom: "2rem",
            }}
          >
            Vos fichiers apparaîtront ici une fois que vous serez connecté
          </p>

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
              <li>Upload de fichiers</li>
              <li>Organisation en dossiers</li>
              <li>Partage de fichiers</li>
              <li>Prévisualisation</li>
              <li>Gestion des permissions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
