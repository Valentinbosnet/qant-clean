import { Activity, ArrowUpRight, Clock } from "lucide-react"

interface RecentActivityListProps {
  extended?: boolean
}

export function RecentActivityList({ extended = false }: RecentActivityListProps) {
  // Activités simulées
  const activities = [
    {
      id: 1,
      type: "view",
      subject: "AAPL",
      time: "Il y a 10 minutes",
      icon: <Activity className="h-4 w-4" />,
    },
    {
      id: 2,
      type: "prediction",
      subject: "MSFT",
      time: "Il y a 30 minutes",
      icon: <ArrowUpRight className="h-4 w-4" />,
    },
    {
      id: 3,
      type: "alert",
      subject: "TSLA",
      time: "Il y a 1 heure",
      icon: <Clock className="h-4 w-4" />,
    },
  ]

  // Afficher plus d'activités si le mode étendu est activé
  const displayActivities = extended ? activities.concat(activities) : activities

  return (
    <div className="space-y-4">
      {displayActivities.map((activity) => (
        <div key={activity.id} className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">{activity.icon}</div>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {activity.type === "view" && "Consulté "}
              {activity.type === "prediction" && "Prédiction pour "}
              {activity.type === "alert" && "Alerte sur "}
              <span className="font-semibold">{activity.subject}</span>
            </p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
