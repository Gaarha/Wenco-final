This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## IA Local (`/ia`)

Página de chat con inteligencia artificial que se ejecuta **100% en el navegador** mediante [WebLLM](https://github.com/mlc-ai/web-llm) y WebGPU — sin servidores ni claves de API.

Al abrir la página se detecta la potencia del dispositivo (GPU, memoria, núcleos, móvil/escritorio) y se recomienda automáticamente el modelo más capaz que puede ejecutar:

| Nivel  | Modelo            | Memoria aprox. |
| ------ | ----------------- | -------------- |
| Básico | Qwen 2.5 0.5B     | ~1 GB          |
| Medio  | Qwen 2.5 1.5B     | ~1.6 GB        |
| Alto   | Llama 3.2 3B      | ~2.3 GB        |
| Ultra  | Llama 3.1 8B      | ~5 GB          |

El usuario puede cambiar de modelo manualmente. El modelo se descarga la primera vez y queda guardado en la caché del navegador. Requiere un navegador con WebGPU (Chrome, Edge o Safari recientes).
