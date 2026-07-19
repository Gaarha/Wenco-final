import type { Metadata } from 'next'
import ChatIA from '@/components/ia/ChatIA'

export const metadata: Metadata = {
  title: 'IA Local — Chat privado en tu dispositivo',
  description:
    'Chatea con una inteligencia artificial que se ejecuta directamente en tu navegador. Cuanto más potente es tu dispositivo, más potente es la IA.',
}

export default function PaginaIA() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <header className="mx-auto mb-6 w-full max-w-3xl text-center">
        <p className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          100% local · tus conversaciones nunca salen de tu dispositivo
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          IA Local
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
          Una inteligencia artificial que se ejecuta directamente en tu navegador, sin servidores.
          Detectamos la potencia de tu dispositivo y cargamos el modelo más capaz que puede mover:
          cuanto mejor sea tu equipo, más inteligente será la IA.
        </p>
      </header>
      <ChatIA />
      <footer className="mx-auto mt-8 w-full max-w-3xl text-center text-xs text-gray-400">
        Funciona con WebGPU y modelos de código abierto (Qwen y Llama) mediante WebLLM.
        <br />
        El modelo se descarga una sola vez y queda guardado en la caché de tu navegador.
      </footer>
    </main>
  )
}
