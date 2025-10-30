export interface Lead {
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

export async function getLeadsFromSheet(): Promise<Lead[]> {
  try {
    console.log("[v0] Obteniendo leads desde Google Apps Script...")

    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL

    if (!scriptUrl) {
      console.error("[v0] GOOGLE_APPS_SCRIPT_URL no está configurada")
      return []
    }

    console.log("[v0] URL del script:", scriptUrl.substring(0, 50) + "...")

    const response = await fetch(scriptUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    console.log("[v0] Status de respuesta:", response.status)
    console.log("[v0] Headers de respuesta:", Object.fromEntries(response.headers.entries()))

    if (response.status === 302 || response.status === 301) {
      const location = response.headers.get("location")
      console.log("[v0] Redirect detectado a:", location)

      if (location) {
        // Seguir el redirect manualmente
        const redirectResponse = await fetch(location, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        })

        if (!redirectResponse.ok) {
          throw new Error(`Error en redirect: ${redirectResponse.status}`)
        }

        const text = await redirectResponse.text()
        console.log("[v0] Respuesta del redirect recibida, longitud:", text.length)
        const data = JSON.parse(text)
        return processLeadsData(data)
      }
    }

    if (!response.ok) {
      console.error("[v0] Error en respuesta:", response.status, response.statusText)
      throw new Error(`Error al obtener datos: ${response.status}`)
    }

    const text = await response.text()
    console.log("[v0] Respuesta recibida, longitud:", text.length)
    console.log("[v0] Primeros 200 caracteres:", text.substring(0, 200))

    const data = JSON.parse(text)
    return processLeadsData(data)
  } catch (error) {
    console.error("[v0] Error al leer datos:", error)
    return []
  }
}

function processLeadsData(data: any): Lead[] {
  console.log("[v0] Datos parseados:", Array.isArray(data) ? data.length : 0, "leads")

  if (Array.isArray(data) && data.length > 0) {
    console.log("[v0] Primer lead raw:", JSON.stringify(data[0]))
    console.log("[v0] Claves disponibles:", Object.keys(data[0]))
  }

  if (!Array.isArray(data)) {
    console.error("[v0] Los datos no son un array:", data)
    return []
  }

  const leads: Lead[] = data
    .filter((row: any) => row.timestamp || row.user_name) // Filtrar filas vacías
    .map((row: any, index: number) => {
      // Función helper para obtener valor con o sin espacios
      const getValue = (key: string): string => {
        return row[key] || row[key + " "] || row[key.trim()] || ""
      }

      const lead = {
        timestamp: row.timestamp || "",
        nombre: row.user_name || "",
        telefono: row.phone_number || "",
        canal: row.canal || "",
        producto: row.producto || "",
        categoria: row.categoria || "",
        subcategoria: row.subcategoria || "",
        m2: getValue("m2").toString(),
        cajas: getValue("cajas").toString(),
        precioCaja: getValue("precio_por_caja").toString(),
        eqM2PorCaja: getValue("eq_m2_por_caja").toString(),
        totalEstimado: getValue("total_estimado").toString(),
        linkImagen: row.link_origen || row.link_imagen || "",
      }

      if (index === 0) {
        console.log("[v0] Primer lead mapeado:", JSON.stringify(lead))
      }

      return lead
    })

  console.log("[v0] Leads procesados exitosamente:", leads.length)
  return leads
}
