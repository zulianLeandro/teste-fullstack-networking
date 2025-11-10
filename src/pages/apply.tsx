// src/pages/apply.tsx
import { ApplicationForm } from '@/components/features/ApplicationForm';
import Head from 'next/head';

export default function ApplyPage() {
  return (
    <>
      <Head>
        <title>Formulário de Intenção</title>
      </Head>
      {/* Container do Tailwind:
        - min-h-screen: altura total da tela
        - flex items-center justify-center: centraliza vertical e horizontal
        - bg-gray-50: um fundo cinza claro
      */}
      <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        {/* Card do Formulário:
          - max-w-lg: largura máxima
          - w-full: 100% da largura até o máximo
          - bg-white: fundo branco
          - p-8: padding
          - shadow-md: sombra
          - rounded-lg: bordas arredondadas
        */}
        <div className="max-w-lg w-full bg-white p-8 shadow-md rounded-lg">
          <h1 className="text-2xl font-bold text-center mb-6">
            Formulário de Intenção
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Preencha os dados abaixo para analisarmos sua participação no
            grupo.
          </p>
          <ApplicationForm />
        </div>
      </main>
    </>
  );
}