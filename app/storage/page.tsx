import { FileUpload } from "@/components/storage/file-upload"

export default function StoragePage() {
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Stockage de fichiers</h1>
      <FileUpload />
    </div>
  )
}
