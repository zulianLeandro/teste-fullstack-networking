// src/pages/_app.tsx
import type { AppProps } from 'next/app';

// 1. IMPORTA O ARQUIVO DE TEMA CORRETO!
// O caminho é "subir" da pasta 'pages' para a 'src' (../)
// e "descer" para a 'app/globals.css'
import '../app/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}