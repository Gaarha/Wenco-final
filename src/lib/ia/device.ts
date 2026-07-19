// Detección de capacidades del dispositivo para elegir el modelo de IA local
// más potente que pueda ejecutar sin problemas.

export type NivelIA = 'basico' | 'medio' | 'alto' | 'ultra'

export interface ModeloIA {
  id: string
  nombre: string
  nivel: NivelIA
  parametros: string
  vramMB: number
  descripcion: string
}

export interface InfoDispositivo {
  webgpu: boolean
  gpuNombre: string | null
  memoriaGB: number | null
  nucleos: number
  esMovil: boolean
  maxBufferMB: number | null
  nivel: NivelIA
  puntaje: number
}

// Modelos precompilados de WebLLM, ordenados de menor a mayor potencia.
// El campo vramMB es el requisito aproximado de memoria de GPU.
export const MODELOS: ModeloIA[] = [
  {
    id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
    nombre: 'Qwen 2.5 · 0.5B',
    nivel: 'basico',
    parametros: '0.5B',
    vramMB: 945,
    descripcion: 'Ultraligero, funciona hasta en móviles modestos.',
  },
  {
    id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
    nombre: 'Qwen 2.5 · 1.5B',
    nivel: 'medio',
    parametros: '1.5B',
    vramMB: 1630,
    descripcion: 'Buen equilibrio para móviles de gama alta y portátiles.',
  },
  {
    id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
    nombre: 'Llama 3.2 · 3B',
    nivel: 'alto',
    parametros: '3B',
    vramMB: 2264,
    descripcion: 'Respuestas más elaboradas, para equipos con buena GPU.',
  },
  {
    id: 'Llama-3.1-8B-Instruct-q4f16_1-MLC',
    nombre: 'Llama 3.1 · 8B',
    nivel: 'ultra',
    parametros: '8B',
    vramMB: 5001,
    descripcion: 'El más potente, requiere GPU dedicada y bastante memoria.',
  },
]

export const NIVEL_ETIQUETA: Record<NivelIA, string> = {
  basico: 'Básico',
  medio: 'Medio',
  alto: 'Alto',
  ultra: 'Ultra',
}

export function modeloPorNivel(nivel: NivelIA): ModeloIA {
  return MODELOS.find((m) => m.nivel === nivel) ?? MODELOS[0]
}

// Tipos mínimos de WebGPU (lib.dom de TypeScript aún no los incluye)
interface AdaptadorGPU {
  limits: { maxBufferSize: number }
  info?: { vendor?: string; architecture?: string; description?: string }
}
interface ApiGPU {
  requestAdapter(): Promise<AdaptadorGPU | null>
}

export async function detectarDispositivo(): Promise<InfoDispositivo> {
  const nav = navigator as Navigator & { deviceMemory?: number }
  const esMovil = /Android|iPhone|iPad|iPod|Mobile/i.test(nav.userAgent)
  const nucleos = nav.hardwareConcurrency ?? 2
  // deviceMemory solo existe en navegadores Chromium y se limita a 8 GB
  const memoriaGB = nav.deviceMemory ?? null

  let webgpu = false
  let gpuNombre: string | null = null
  let maxBufferMB: number | null = null

  const gpu = (nav as unknown as { gpu?: ApiGPU }).gpu
  if (gpu) {
    try {
      const adapter = await gpu.requestAdapter()
      if (adapter) {
        webgpu = true
        maxBufferMB = Math.round(adapter.limits.maxBufferSize / (1024 * 1024))
        if (adapter.info) {
          gpuNombre =
            [adapter.info.vendor, adapter.info.architecture ?? adapter.info.description]
              .filter(Boolean)
              .join(' ') || null
        }
      }
    } catch {
      webgpu = false
    }
  }

  // Puntaje 0-100 según las señales de hardware disponibles
  let puntaje = 0
  if (webgpu) puntaje += 25
  if (memoriaGB !== null) puntaje += Math.min(memoriaGB, 8) * 4 // hasta 32
  else puntaje += 12 // sin dato (Safari/Firefox): asumimos gama media
  puntaje += Math.min(nucleos, 16) * 2 // hasta 32
  if (maxBufferMB !== null && maxBufferMB >= 2048) puntaje += 11
  if (esMovil) puntaje = Math.round(puntaje * 0.55)

  let nivel: NivelIA
  if (!webgpu) nivel = 'basico'
  else if (puntaje >= 75) nivel = 'ultra'
  else if (puntaje >= 55) nivel = 'alto'
  else if (puntaje >= 35) nivel = 'medio'
  else nivel = 'basico'

  // Nunca asignar un modelo que exceda la memoria estimada de la GPU
  if (webgpu && maxBufferMB !== null) {
    const modelo = modeloPorNivel(nivel)
    if (modelo.vramMB > maxBufferMB * 4) {
      const viable = [...MODELOS].reverse().find((m) => m.vramMB <= maxBufferMB * 4)
      nivel = viable?.nivel ?? 'basico'
    }
  }

  return { webgpu, gpuNombre, memoriaGB, nucleos, esMovil, maxBufferMB, nivel, puntaje }
}
