"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, TrendingUp, Package, Tag, LogOut } from "lucide-react"
import { LeadsChart } from "@/components/leads-chart"

interface Lead {
  timestamp: string
  nombre: string
  telefono: string
  canal: string
  producto: string
  categoria: string
  subcategoria: string
  m2: string
  cajas: string
  precioCaja: string
  eqM2PorCaja: string
  totalEstimado: string
  linkImagen: string
}

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, authLoading, router])

  const [searchQuery, setSearchQuery] = useState("")
  const [canal, setCanal] = useState("all")
  const [producto, setProducto] = useState("all")
  const [categoria, setCategoria] = useState("all")

  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLeads() {
      try {
        setLoading(true)
        const response = await fetch("/api/leads")
        if (!response.ok) {
          throw new Error("Error al cargar los leads")
        }
        const data = await response.json()
        console.log("[v0] Leads cargados:", data.leads.length)
        setLeads(data.leads)
        setError(null)
      } catch (err) {
        console.error("[v0] Error al cargar leads:", err)
        setError("Error al cargar los datos")
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [])

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || lead.telefono.includes(searchQuery)
    const matchesCanal = canal === "all" || lead.canal === canal
    const matchesProducto = producto === "all" || lead.producto === producto
    const matchesCategoria = categoria === "all" || lead.categoria === categoria

    return matchesSearch && matchesCanal && matchesProducto && matchesCategoria
  })

  const leadsNuevos = filteredLeads.length

  const productoMasConsultado =
    filteredLeads.length > 0
      ? Object.entries(
          filteredLeads.reduce(
            (acc, lead) => {
              acc[lead.producto] = (acc[lead.producto] || 0) + 1
              return acc
            },
            {} as Record<string, number>,
          ),
        ).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"
      : "N/A"

  const categoriaMasPopular =
    filteredLeads.length > 0
      ? Object.entries(
          filteredLeads.reduce(
            (acc, lead) => {
              acc[lead.categoria] = (acc[lead.categoria] || 0) + 1
              return acc
            },
            {} as Record<string, number>,
          ),
        ).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"
      : "N/A"

  const canales = Array.from(new Set(leads.map((l) => l.canal).filter(Boolean)))
  const productos = Array.from(new Set(leads.map((l) => l.producto).filter(Boolean)))
  const categorias = Array.from(new Set(leads.map((l) => l.categoria).filter(Boolean)))

  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
    } catch {
      return timestamp
    }
  }

  const formatCurrency = (value: string) => {
    const num = Number.parseFloat(value)
    if (isNaN(num)) return value
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(num)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Hauster CRM</h1>
          <p className="text-gray-400 capitalize">{currentDate}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-400">Dashboard de Leads</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="border-zinc-700 text-gray-400 hover:text-white hover:bg-zinc-800 bg-transparent"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-red-900/20 border border-red-900 rounded-lg text-red-400">{error}</div>}

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Leads Nuevos</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : leadsNuevos}</div>
            <p className="text-xs text-gray-400 mt-1">Total de consultas</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Producto Más Consultado</CardTitle>
            <Package className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : productoMasConsultado}</div>
            <p className="text-xs text-gray-400 mt-1">Producto con más interés</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Categoría Más Popular</CardTitle>
            <Tag className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : categoriaMasPopular}</div>
            <p className="text-xs text-gray-400 mt-1">Categoría con más consultas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="bg-zinc-900 border-zinc-800 mb-8">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o teléfono"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-black border-zinc-700 text-white placeholder:text-gray-500"
              />
            </div>

            <Select value={canal} onValueChange={setCanal}>
              <SelectTrigger className="bg-black border-zinc-700 text-white">
                <SelectValue placeholder="Canal" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem value="all">Canal</SelectItem>
                {canales.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={producto} onValueChange={setProducto}>
              <SelectTrigger className="bg-black border-zinc-700 text-white">
                <SelectValue placeholder="Todos los productos" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem value="all">Todos los productos</SelectItem>
                {productos.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="bg-black border-zinc-700 text-white">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categorias.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Leads por Día */}
      <Card className="bg-zinc-900 border-zinc-800 mb-8">
        <CardHeader>
          <CardTitle>Leads por Día</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadsChart leads={filteredLeads} />
        </CardContent>
      </Card>

      {/* Tabla de Leads */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Tabla de Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-zinc-800">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableHead className="text-gray-400">Fecha</TableHead>
                  <TableHead className="text-gray-400">Nombre</TableHead>
                  <TableHead className="text-gray-400">Teléfono</TableHead>
                  <TableHead className="text-gray-400">Producto</TableHead>
                  <TableHead className="text-gray-400">Categoría</TableHead>
                  <TableHead className="text-gray-400">m²</TableHead>
                  <TableHead className="text-gray-400">Total Estimado</TableHead>
                  <TableHead className="text-gray-400">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-400">
                      Cargando leads...
                    </TableCell>
                  </TableRow>
                ) : filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-400">
                      No hay leads que coincidan con los filtros
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead, index) => (
                    <TableRow key={index} className="border-zinc-800 hover:bg-zinc-800/50">
                      <TableCell>{formatDate(lead.timestamp)}</TableCell>
                      <TableCell>{lead.nombre}</TableCell>
                      <TableCell>{lead.telefono}</TableCell>
                      <TableCell>{lead.producto}</TableCell>
                      <TableCell>{lead.categoria}</TableCell>
                      <TableCell>{lead.m2}</TableCell>
                      <TableCell>{formatCurrency(lead.totalEstimado)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
