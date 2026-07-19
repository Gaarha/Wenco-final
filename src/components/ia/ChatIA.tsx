'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { MLCEngine } from '@mlc-ai/web-llm'
import {
  MODELOS,
  NIVEL_ETIQUETA,
  detectarDispositivo,
  modeloPorNivel,
  type InfoDispositivo,
  type ModeloIA,
} from '@/lib/ia/device'

type EstadoMotor = 'detectando' | 'listo-para-cargar' | 'cargando' | 'listo' | 'generando' | 'error' | 'sin-webgpu'

interface Mensaje {
  rol: 'user' | 'assistant'
  texto: string
}

const NIVEL_COLOR: Record<string, string> = {
  basico: 'bg-gray-100 text-gray-700 border-gray-300',
  medio: 'bg-blue-50 text-blue-700 border-blue-300',
  alto: 'bg-violet-50 text-violet-700 border-violet-300',
  ultra: 'bg-amber-50 text-amber-700 border-amber-300',
}

const SYSTEM_PROMPT =
  'Eres un asistente de IA útil y amable que se ejecuta localmente en el dispositivo del usuario. ' +
  'Responde siempre en el idioma en que te escriban, de forma clara y concisa.'

export default function ChatIA() {
  const [estado, setEstado] = useState<EstadoMotor>('detectando')
  const [info, setInfo] = useState<InfoDispositivo | null>(null)
  const [modelo, setModelo] = useState<ModeloIA | null>(null)
  const [progreso, setProgreso] = useState(0)
  const [progresoTexto, setProgresoTexto] = useState('')
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [entrada, setEntrada] = useState('')
  const [error, setError] = useState('')
  const [tokensPorSeg, setTokensPorSeg] = useState<number | null>(null)

  const engineRef = useRef<MLCEngine | null>(null)
  const finChatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let activo = true
    detectarDispositivo().then((d) => {
      if (!activo) return
      setInfo(d)
      setModelo(modeloPorNivel(d.nivel))
      setEstado(d.webgpu ? 'listo-para-cargar' : 'sin-webgpu')
    })
    return () => {
      activo = false
    }
  }, [])

  useEffect(() => {
    finChatRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const cargarModelo = useCallback(async () => {
    if (!modelo) return
    setEstado('cargando')
    setError('')
    setProgreso(0)
    setProgresoTexto('Preparando descarga…')
    try {
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm')
      if (engineRef.current) {
        await engineRef.current.unload()
        engineRef.current = null
      }
      const engine = await CreateMLCEngine(modelo.id, {
        initProgressCallback: (p) => {
          setProgreso(Math.round(p.progress * 100))
          setProgresoTexto(p.text)
        },
      })
      engineRef.current = engine
      setEstado('listo')
      setMensajes([])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el modelo.')
      setEstado('error')
    }
  }, [modelo])

  const enviar = useCallback(async () => {
    const texto = entrada.trim()
    const engine = engineRef.current
    if (!texto || !engine || estado !== 'listo') return

    const historial = [...mensajes, { rol: 'user' as const, texto }]
    setMensajes([...historial, { rol: 'assistant', texto: '' }])
    setEntrada('')
    setEstado('generando')
    setError('')

    try {
      const inicio = performance.now()
      let generado = 0
      const stream = await engine.chat.completions.create({
        stream: true,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...historial.map((m) => ({ role: m.rol, content: m.texto })),
        ],
        temperature: 0.7,
        max_tokens: 1024,
      })
      let respuesta = ''
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? ''
        if (delta) {
          respuesta += delta
          generado++
          setMensajes([...historial, { rol: 'assistant', texto: respuesta }])
        }
      }
      const seg = (performance.now() - inicio) / 1000
      if (seg > 0 && generado > 0) setTokensPorSeg(Math.round(generado / seg))
      setEstado('listo')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al generar la respuesta.')
      setEstado('listo')
    }
  }, [entrada, mensajes, estado])

  const modeloRecomendado = info ? modeloPorNivel(info.nivel) : null

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      {/* Panel del dispositivo */}
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-gray-900">Tu dispositivo</h2>
          {estado === 'detectando' && <span className="text-xs text-gray-500">Analizando hardware…</span>}
          {info && (
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${NIVEL_COLOR[info.nivel]}`}
            >
              Potencia: {NIVEL_ETIQUETA[info.nivel]}
            </span>
          )}
        </div>

        {info && (
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 sm:grid-cols-4">
            <div>
              <dt className="font-medium text-gray-400">Tipo</dt>
              <dd>{info.esMovil ? 'Móvil / tablet' : 'Ordenador'}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-400">Núcleos CPU</dt>
              <dd>{info.nucleos}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-400">Memoria RAM</dt>
              <dd>{info.memoriaGB !== null ? `≈ ${info.memoriaGB} GB` : 'No disponible'}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-400">GPU (WebGPU)</dt>
              <dd>{info.webgpu ? (info.gpuNombre ?? 'Compatible') : 'No compatible'}</dd>
            </div>
          </dl>
        )}
      </section>

      {/* Sin WebGPU */}
      {estado === 'sin-webgpu' && (
        <section className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">Tu navegador no soporta WebGPU</p>
          <p className="mt-1">
            La IA local necesita WebGPU para ejecutarse en tu dispositivo. Prueba con una versión
            reciente de Chrome, Edge o Safari. En Firefox puedes activarlo en{' '}
            <code className="rounded bg-amber-100 px-1">about:config</code> con{' '}
            <code className="rounded bg-amber-100 px-1">dom.webgpu.enabled</code>.
          </p>
        </section>
      )}

      {/* Selección y carga del modelo */}
      {info?.webgpu && estado !== 'listo' && estado !== 'generando' && (
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Modelo de IA</h2>
          <p className="mt-1 text-xs text-gray-500">
            Según tu hardware te recomendamos{' '}
            <span className="font-medium text-gray-700">{modeloRecomendado?.nombre}</span>. Cuanto más
            potente sea tu dispositivo, más grande es el modelo que puede ejecutar.
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {MODELOS.map((m) => {
              const seleccionado = modelo?.id === m.id
              const recomendado = modeloRecomendado?.id === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  disabled={estado === 'cargando'}
                  onClick={() => setModelo(m)}
                  className={`rounded-lg border p-3 text-left transition-colors disabled:opacity-50 ${
                    seleccionado
                      ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-gray-900">{m.nombre}</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${NIVEL_COLOR[m.nivel]}`}
                    >
                      {NIVEL_ETIQUETA[m.nivel]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{m.descripcion}</p>
                  <p className="mt-1 text-[10px] text-gray-400">
                    {m.parametros} parámetros · ~{(m.vramMB / 1024).toFixed(1)} GB de memoria
                    {recomendado && <span className="ml-1 font-semibold text-blue-600">· Recomendado</span>}
                  </p>
                </button>
              )
            })}
          </div>

          {estado === 'cargando' ? (
            <div className="mt-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{ width: `${progreso}%` }}
                />
              </div>
              <p className="mt-2 truncate text-xs text-gray-500">{progresoTexto}</p>
              <p className="mt-1 text-[10px] text-gray-400">
                La primera vez se descarga el modelo y queda guardado en la caché del navegador.
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={cargarModelo}
              disabled={!modelo}
              className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              Cargar {modelo?.nombre ?? 'modelo'}
            </button>
          )}
        </section>
      )}

      {error && (
        <p className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      {/* Chat */}
      {(estado === 'listo' || estado === 'generando') && modelo && (
        <section className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-2">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-medium">{modelo.nombre}</span>
              <span className="text-gray-400">· ejecutándose en tu dispositivo</span>
              {tokensPorSeg !== null && <span className="text-gray-400">· {tokensPorSeg} tok/s</span>}
            </div>
            <button
              type="button"
              onClick={() => setEstado('listo-para-cargar')}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Cambiar modelo
            </button>
          </div>

          <div className="flex max-h-[55vh] min-h-[16rem] flex-col gap-3 overflow-y-auto p-4">
            {mensajes.length === 0 && (
              <p className="m-auto text-center text-sm text-gray-400">
                Escribe tu primer mensaje. Todo se procesa aquí, en tu dispositivo:
                <br />
                nada se envía a ningún servidor.
              </p>
            )}
            {mensajes.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
                  m.rol === 'user'
                    ? 'self-end rounded-br-sm bg-blue-600 text-white'
                    : 'self-start rounded-bl-sm bg-gray-100 text-gray-900'
                }`}
              >
                {m.texto || (estado === 'generando' && i === mensajes.length - 1 ? 'Pensando…' : '')}
              </div>
            ))}
            <div ref={finChatRef} />
          </div>

          <form
            className="flex items-end gap-2 border-t border-gray-100 p-3"
            onSubmit={(e) => {
              e.preventDefault()
              enviar()
            }}
          >
            <textarea
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  enviar()
                }
              }}
              rows={1}
              placeholder="Escribe un mensaje…"
              className="max-h-32 flex-1 resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={estado === 'generando' || !entrada.trim()}
              className="inline-flex h-9 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {estado === 'generando' ? 'Generando…' : 'Enviar'}
            </button>
          </form>
        </section>
      )}
    </div>
  )
}
