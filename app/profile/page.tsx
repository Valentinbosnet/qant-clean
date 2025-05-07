"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function ProfilePage() {
  const { user, signOut, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>
        <div className="bg-muted p-8 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
          <p className="mb-6">Please sign in to view your profile.</p>
          <Button asChild>
            <Link href="/auth">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>

      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>View and manage your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">Email</h3>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Account ID</h3>
              <p className="text-muted-foreground text-sm">{user.id}</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Account Created</h3>
              <p className="text-muted-foreground">{new Date(user.created_at || Date.now()).toLocaleDateString()}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/favorites">My Favorites</Link>
            </Button>
            <Button variant="destructive" onClick={signOut}>
              Sign Out
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
