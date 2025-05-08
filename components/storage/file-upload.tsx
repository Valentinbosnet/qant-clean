"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getBrowserClient } from "@/lib/client-supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, File, X } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string }[]>([])
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = getBrowserClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file || !user) return

    setUploading(true)
    setProgress(0)

    try {
      // Créer le bucket s'il n'existe pas
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket("user-files")

      if (bucketError && bucketError.message.includes("does not exist")) {
        await supabase.storage.createBucket("user-files", {
          public: false,
          fileSizeLimit: 10485760, // 10MB
        })
      }

      // Générer un nom de fichier unique
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/${uuidv4()}.${fileExt}`

      // Télécharger le fichier
      const { data, error } = await supabase.storage.from("user-files").upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
        onUploadProgress: (progress) => {
          setProgress(Math.round((progress.loaded / progress.total) * 100))
        },
      })

      if (error) throw error

      // Obtenir l'URL du fichier
      const { data: urlData } = await supabase.storage.from("user-files").createSignedUrl(fileName, 60 * 60 * 24) // 24 heures

      if (urlData) {
        setUploadedFiles((prev) => [...prev, { name: file.name, url: urlData.signedUrl }])
        toast({
          title: "Fichier téléchargé",
          description: "Votre fichier a été téléchargé avec succès",
        })
      }
    } catch (error: any) {
      console.error("Erreur lors du téléchargement:", error)
      toast({
        title: "Erreur",
        description: error.message || "Impossible de télécharger le fichier",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      setFile(null)
      setProgress(0)
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Téléchargement de fichiers</CardTitle>
          <CardDescription>Connectez-vous pour télécharger des fichiers</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Téléchargement de fichiers</CardTitle>
        <CardDescription>Téléchargez des fichiers dans votre espace de stockage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Input type="file" onChange={handleFileChange} disabled={uploading} className="flex-1" />
          <Button onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Téléchargement...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" /> Télécharger
              </>
            )}
          </Button>
        </div>

        {uploading && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-center">{progress}%</p>
          </div>
        )}

        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Fichiers téléchargés</h3>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center">
                    <File className="h-4 w-4 mr-2" />
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {file.name}
                    </a>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFile(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
