export default function StaticPage() {
  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>Page Statique Simple</h1>
      <p>Cette page est complètement statique sans aucun import ni composant client.</p>
      <div style={{ marginTop: "20px", padding: "15px", border: "1px solid #ccc", borderRadius: "5px" }}>
        Contenu statique
      </div>
    </div>
  )
}
