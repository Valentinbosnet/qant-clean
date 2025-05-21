export function SimpleList() {
  const items = [
    { id: 1, name: "Élément 1" },
    { id: 2, name: "Élément 2" },
    { id: 3, name: "Élément 3" },
    { id: 4, name: "Élément 4" },
    { id: 5, name: "Élément 5" },
  ]

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-semibold mb-2">Liste Simple</h2>
      <ul className="list-disc pl-5">
        {items.map((item) => (
          <li key={item.id} className="mb-1">
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
