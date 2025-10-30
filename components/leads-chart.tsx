"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

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

interface LeadsChartProps {
  leads: Lead[]
}

export function LeadsChart({ leads }: LeadsChartProps) {
  const leadsByDate = leads.reduce(
    (acc, lead) => {
      try {
        const date = new Date(lead.timestamp)
        const dateStr = date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
        if (dateStr && dateStr !== "Invalid Date") {
          acc[dateStr] = (acc[dateStr] || 0) + 1
        }
      } catch (error) {
        console.error("[v0] Error al procesar fecha:", lead.timestamp)
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const chartData = Object.entries(leadsByDate)
    .map(([date, count]) => ({
      date,
      leads: count,
    }))
    .sort((a, b) => {
      const parseDate = (dateStr: string) => {
        const [day, month] = dateStr.split(" ")
        const monthMap: Record<string, number> = {
          ene: 0,
          feb: 1,
          mar: 2,
          abr: 3,
          may: 4,
          jun: 5,
          jul: 6,
          ago: 7,
          sep: 8,
          oct: 9,
          nov: 10,
          dic: 11,
        }
        return new Date(2025, monthMap[month] || 0, Number.parseInt(day))
      }
      return parseDate(a.date).getTime() - parseDate(b.date).getTime()
    })
    .slice(-30)

  return (
    <div className="h-[250px] w-full overflow-hidden">
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">Sin datos</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "6px",
                color: "#fff",
              }}
              labelStyle={{ color: "#fff" }}
            />
            <Area type="monotone" dataKey="leads" stroke="#f97316" fill="#f97316" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
