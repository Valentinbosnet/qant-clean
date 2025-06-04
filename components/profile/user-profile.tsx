"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function UserProfile() {
  const { data: session, status } = useSession()
  const [isEditing, setIsEditing] = useState(false)

  if (status === "loading") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chargement du profil...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-[200px] bg-muted animate-pulse rounded" />
              <div className="h-4 w-[150px] bg-muted animate-pulse rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (status === "unauthenticated") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profil non disponible</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Veuillez vous connecter pour voir votre profil.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Votre Profil</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
              <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">{session?.user?.name}</h3>
              <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={() => setIsEditing(!isEditing)}>{isEditing ? "Annuler" : "Modifier le profil"}</Button>
            {isEditing && <Button variant="outline">Enregistrer</Button>}
          </div>

          {isEditing && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right">
                  Nom
                </label>
                <input
                  id="name"
                  defaultValue={session?.user?.name || ""}
                  className="col-span-3 px-3 py-2 border rounded"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="email" className="text-right">
                  Email
                </label>
                <input
                  id="email"
                  defaultValue={session?.user?.email || ""}
                  className="col-span-3 px-3 py-2 border rounded"
                  disabled
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
