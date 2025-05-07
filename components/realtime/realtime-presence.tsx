"use client"

import { useEffect, useState } from "react"
import { getBrowserClient } from "@/lib/supabase-config"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"

interface Presence {
  id: string
  lastSeen: string
  name?: string
}

export function RealtimePresence() {
  const [presences, setPresences] = useState<Presence[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const supabase = getBrowserClient()

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    // Canal pour la présence en temps réel
    const channel = supabase.channel("online-users", {
      config: {
        presence: {
          key: user.id,
        },
      },
    })

    // Gérer les mises à jour de présence
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState()
        const presenceList: Presence[] = []

        Object.keys(state).forEach((presenceId) => {
          const presence = state[presenceId][0] as any
          presenceList.push({
            id: presenceId,
            lastSeen: new Date().toISOString(),
            name: presence.user_name || `Utilisateur ${presenceId.substring(0, 4)}`,
          })
        })

        setPresences(presenceList)
        setIsLoading(false)
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Envoyer notre présence
          await channel.track({
            user_id: user.id,
            user_name: user.user_metadata?.full_name || user.email?.split("@")[0],
            online_at: new Date().toISOString(),
          })
        }
      })

    // Nettoyer lors du démontage
    return () => {
      channel.unsubscribe()
    }
  }, [user])

  // Obtenir les initiales pour l'avatar
  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase()
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs en ligne</CardTitle>
          <CardDescription>Connectez-vous pour voir les utilisateurs en ligne</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Utilisateurs en ligne</CardTitle>
        <CardDescription>Voir qui est actuellement connecté à l'application</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : presences.length === 0 ? (
          <p className="text-center text-muted-foreground">Aucun utilisateur en ligne</p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center">
              <Badge variant="outline" className="mr-2">
                {presences.length}
              </Badge>
              <span>utilisateur{presences.length > 1 ? "s" : ""} en ligne</span>
            </div>
            <div className="grid gap-2">
              {presences.map((presence) => (
                <div key={presence.id} className="flex items-center p-2 border rounded-md">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback>{getInitials(presence.name || "User")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{presence.name}</p>
                    <p className="text-xs text-muted-foreground">
                      En ligne depuis {new Date(presence.lastSeen).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
