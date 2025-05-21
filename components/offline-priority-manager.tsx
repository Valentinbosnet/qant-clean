"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle, Edit, Plus, RefreshCw, Save, Trash2, ZapIcon } from "lucide-react"
import {
  CachePriority,
  PRIORITY_RETENTION,
  type PriorityRule,
  getCacheItemsByPriority,
  getCacheStats,
  getPriorityRules,
  savePriorityRule,
  deletePriorityRule,
  resetPriorityRules,
  changeCacheItemPriority,
} from "@/lib/offline-mode"

// Couleurs par priorité
const priorityColors: Record<CachePriority, string> = {
  [CachePriority.CRITICAL]: "bg-red-500 hover:bg-red-600",
  [CachePriority.HIGH]: "bg-orange-500 hover:bg-orange-600",
  [CachePriority.MEDIUM]: "bg-blue-500 hover:bg-blue-600",
  [CachePriority.LOW]: "bg-green-500 hover:bg-green-600",
  [CachePriority.TEMPORARY]: "bg-gray-500 hover:bg-gray-600",
}

// Libellés par priorité
const priorityLabels: Record<CachePriority, string> = {
  [CachePriority.CRITICAL]: "Critique",
  [CachePriority.HIGH]: "Haute",
  [CachePriority.MEDIUM]: "Moyenne",
  [CachePriority.LOW]: "Basse",
  [CachePriority.TEMPORARY]: "Temporaire",
}

// Descriptions par priorité
const priorityDescriptions: Record<CachePriority, string> = {
  [CachePriority.CRITICAL]: "Données essentielles, jamais supprimées automatiquement",
  [CachePriority.HIGH]: "Données importantes, conservées 30 jours",
  [CachePriority.MEDIUM]: "Priorité normale, conservées 7 jours",
  [CachePriority.LOW]: "Faible priorité, conservées 3 jours",
  [CachePriority.TEMPORARY]: "Données temporaires, conservées 1 jour",
}

export function OfflinePriorityManager() {
  const [rules, setRules] = useState<PriorityRule[]>([])
  const [stats, setStats] = useState(getCacheStats())
  const [selectedTab, setSelectedTab] = useState("rules")
  const [isLoading, setIsLoading] = useState(false)
  const [editingRule, setEditingRule] = useState<PriorityRule | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [cacheItems, setCacheItems] = useState<Record<CachePriority, Array<{ key: string; meta: any }>>>({
    [CachePriority.CRITICAL]: [],
    [CachePriority.HIGH]: [],
    [CachePriority.MEDIUM]: [],
    [CachePriority.LOW]: [],
    [CachePriority.TEMPORARY]: [],
  })
  const [selectedPriority, setSelectedPriority] = useState<CachePriority | null>(CachePriority.MEDIUM)
  const [changingItemKey, setChangingItemKey] = useState<string | null>(null)
  const [newPriority, setNewPriority] = useState<CachePriority>(CachePriority.MEDIUM)

  // Formater la taille en KB ou MB
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  // Formater la durée de rétention
  const formatRetention = (ms: number) => {
    if (ms === Number.POSITIVE_INFINITY) return "Jamais supprimé"
    const days = Math.floor(ms / (24 * 60 * 60 * 1000))
    return `${days} jour${days > 1 ? "s" : ""}`
  }

  // Charger les règles et les statistiques
  const loadData = () => {
    setRules(getPriorityRules())
    setStats(getCacheStats())

    // Charger les éléments du cache pour chaque priorité
    const items: Record<CachePriority, Array<{ key: string; meta: any }>> = {
      [CachePriority.CRITICAL]: [],
      [CachePriority.HIGH]: [],
      [CachePriority.MEDIUM]: [],
      [CachePriority.LOW]: [],
      [CachePriority.TEMPORARY]: [],
    }

    Object.values(CachePriority).forEach((priority) => {
      items[priority] = getCacheItemsByPriority(priority)
    })

    setCacheItems(items)
  }

  // Créer ou mettre à jour une règle
  const saveRule = () => {
    if (!editingRule) return

    setIsLoading(true)
    savePriorityRule(editingRule)

    setTimeout(() => {
      loadData()
      setIsLoading(false)
      setIsDialogOpen(false)
      setEditingRule(null)
    }, 300)
  }

  // Supprimer une règle
  const deleteRule = (ruleId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette règle ?")) {
      setIsLoading(true)
      deletePriorityRule(ruleId)

      setTimeout(() => {
        loadData()
        setIsLoading(false)
      }, 300)
    }
  }

  // Réinitialiser les règles
  const resetRules = () => {
    if (confirm("Êtes-vous sûr de vouloir réinitialiser toutes les règles ?")) {
      setIsLoading(true)
      resetPriorityRules()

      setTimeout(() => {
        loadData()
        setIsLoading(false)
      }, 300)
    }
  }

  // Changer la priorité d'un élément
  const changeItemPriority = (key: string) => {
    if (!key || !newPriority) return

    setIsLoading(true)
    const success = changeCacheItemPriority(key, newPriority)

    setTimeout(() => {
      loadData()
      setIsLoading(false)
      setChangingItemKey(null)

      if (success) {
        alert(`Priorité de "${key}" changée en ${priorityLabels[newPriority]}`)
      } else {
        alert(`Erreur lors du changement de priorité pour "${key}"`)
      }
    }, 300)
  }

  // Créer une nouvelle règle
  const createNewRule = () => {
    setEditingRule({
      id: `rule_${Date.now()}`,
      pattern: "",
      priority: CachePriority.MEDIUM,
      enabled: true,
    })
    setIsDialogOpen(true)
  }

  // Éditer une règle existante
  const editRule = (rule: PriorityRule) => {
    setEditingRule({ ...rule })
    setIsDialogOpen(true)
  }

  // Charger les données au chargement
  useEffect(() => {
    loadData()
  }, [])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ZapIcon className="h-5 w-5" />
          Gestionnaire de priorités des données hors ligne
        </CardTitle>
        <CardDescription>Définissez quelles données doivent être conservées en priorité</CardDescription>
      </CardHeader>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mx-6">
          <TabsTrigger value="rules">Règles de priorité</TabsTrigger>
          <TabsTrigger value="data">Données en cache</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
        </TabsList>

        <CardContent>
          <TabsContent value="rules" className="space-y-4 mt-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Règles de priorité</h3>
              <div className="space-x-2">
                <Button variant="outline" onClick={resetRules} disabled={isLoading}>
                  Réinitialiser
                </Button>
                <Button onClick={createNewRule} disabled={isLoading}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle règle
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Motif</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      Aucune règle définie
                    </TableCell>
                  </TableRow>
                ) : (
                  rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-mono text-sm">{rule.pattern || "-"}</TableCell>
                      <TableCell>{rule.type || "-"}</TableCell>
                      <TableCell>
                        <Badge className={priorityColors[rule.priority]}>{priorityLabels[rule.priority]}</Badge>
                      </TableCell>
                      <TableCell>
                        {rule.enabled ? (
                          <Badge variant="outline" className="bg-green-50">
                            Activée
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50">
                            Désactivée
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => editRule(rule)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteRule(rule.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="bg-muted p-4 rounded-lg mt-4">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4" />
                Niveaux de priorité
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(CachePriority).map((priority) => (
                  <div key={priority} className="flex items-start gap-2">
                    <Badge className={priorityColors[priority]}>{priorityLabels[priority]}</Badge>
                    <div className="text-sm">
                      <p>{priorityDescriptions[priority]}</p>
                      <p className="text-muted-foreground">
                        Durée de conservation: {formatRetention(PRIORITY_RETENTION[priority])}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-4 mt-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Données en cache par priorité</h3>
              <Select
                value={selectedPriority || CachePriority.MEDIUM}
                onValueChange={(value) => setSelectedPriority(value as CachePriority)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CachePriority.MEDIUM}>Toutes les priorités</SelectItem>
                  {Object.values(CachePriority).map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priorityLabels[priority]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {Object.values(CachePriority)
              .filter((priority) => !selectedPriority || priority === selectedPriority)
              .map((priority) => (
                <div key={priority} className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Badge className={priorityColors[priority]}>{priorityLabels[priority]}</Badge>
                    <span>({cacheItems[priority].length} éléments)</span>
                  </h4>

                  {cacheItems[priority].length === 0 ? (
                    <p className="text-muted-foreground text-sm py-2">Aucune donnée avec cette priorité</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Clé</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Taille</TableHead>
                          <TableHead>Accès</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cacheItems[priority].slice(0, 10).map((item) => (
                          <TableRow key={item.key}>
                            <TableCell className="font-mono text-xs truncate max-w-[200px]" title={item.key}>
                              {item.key}
                            </TableCell>
                            <TableCell>{item.meta.type}</TableCell>
                            <TableCell>{formatSize(item.meta.originalSize)}</TableCell>
                            <TableCell>{item.meta.accessCount} fois</TableCell>
                            <TableCell className="text-right">
                              {changingItemKey === item.key ? (
                                <div className="flex items-center justify-end gap-2">
                                  <Select
                                    value={newPriority}
                                    onValueChange={(value) => setNewPriority(value as CachePriority)}
                                    className="w-[120px]"
                                  >
                                    {Object.values(CachePriority).map((p) => (
                                      <SelectItem key={p} value={p}>
                                        {priorityLabels[p]}
                                      </SelectItem>
                                    ))}
                                  </Select>
                                  <Button size="sm" onClick={() => changeItemPriority(item.key)}>
                                    <Save className="h-3 w-3 mr-1" />
                                    OK
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => setChangingItemKey(null)}>
                                    Annuler
                                  </Button>
                                </div>
                              ) : (
                                <Button variant="outline" size="sm" onClick={() => setChangingItemKey(item.key)}>
                                  Changer priorité
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}

                  {cacheItems[priority].length > 10 && (
                    <p className="text-xs text-muted-foreground text-right">
                      Affichage des 10 premiers éléments sur {cacheItems[priority].length}
                    </p>
                  )}
                </div>
              ))}
          </TabsContent>

          <TabsContent value="stats" className="space-y-4 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Éléments en cache</p>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Taille totale</p>
                <p className="text-2xl font-bold">{formatSize(stats.totalSize)}</p>
              </div>
            </div>

            <h4 className="font-medium mt-6 mb-2">Répartition par priorité</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Éléments</TableHead>
                  <TableHead>Taille</TableHead>
                  <TableHead>% du total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.values(CachePriority).map((priority) => (
                  <TableRow key={priority}>
                    <TableCell>
                      <Badge className={priorityColors[priority]}>{priorityLabels[priority]}</Badge>
                    </TableCell>
                    <TableCell>{stats.itemsByPriority[priority] || 0}</TableCell>
                    <TableCell>{formatSize(stats.sizeByPriority[priority] || 0)}</TableCell>
                    <TableCell>
                      {stats.totalSize > 0
                        ? `${Math.round(((stats.sizeByPriority[priority] || 0) / stats.totalSize) * 100)}%`
                        : "0%"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Button variant="outline" className="mt-4" onClick={loadData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Rafraîchir les statistiques
            </Button>
          </TabsContent>
        </CardContent>
      </Tabs>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => window.history.back()}>
          Retour
        </Button>
        <Button onClick={loadData} disabled={isLoading}>
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Chargement...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualiser
            </>
          )}
        </Button>
      </CardFooter>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRule?.id.startsWith("rule_") ? "Nouvelle règle" : "Modifier la règle"}</DialogTitle>
            <DialogDescription>
              Définissez les critères pour attribuer automatiquement une priorité aux données en cache.
            </DialogDescription>
          </DialogHeader>

          {editingRule && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="pattern">Motif (utiliser * comme joker)</Label>
                <Input
                  id="pattern"
                  value={editingRule.pattern}
                  onChange={(e) => setEditingRule({ ...editingRule, pattern: e.target.value })}
                  placeholder="Ex: user_* ou *favorites*"
                />
                <p className="text-xs text-muted-foreground">
                  Le motif est appliqué à la clé de l'élément en cache. Utilisez * comme joker.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type de données (optionnel)</Label>
                <Input
                  id="type"
                  value={editingRule.type || ""}
                  onChange={(e) => setEditingRule({ ...editingRule, type: e.target.value })}
                  placeholder="Ex: json, image"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priorité</Label>
                <Select
                  value={editingRule.priority}
                  onValueChange={(value) => setEditingRule({ ...editingRule, priority: value as CachePriority })}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CachePriority).map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priorityLabels[priority]} - {priorityDescriptions[priority]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  checked={editingRule.enabled}
                  onCheckedChange={(checked) => setEditingRule({ ...editingRule, enabled: checked })}
                />
                <Label htmlFor="enabled">Règle activée</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveRule}>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
