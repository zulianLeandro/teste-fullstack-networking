// src/pages/api/admin/applications/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma'; // <-- CORRIGIDO

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Blindagem do Método (Só aceitamos GET)
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // NOTA: Aqui entraria a lógica de autenticação do admin.
  // Por enquanto, vamos deixar aberto para construir.

  try {
    // 2. Lógica de Negócio (Buscar no Banco)
    const applications = await prisma.application.findMany({
      // Ordena pelas mais recentes primeiro
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 3. Resposta de Sucesso
    return res.status(200).json(applications);
  } catch (error) {
    // 4. Tratamento de Erro
    console.error('Erro ao listar aplicações:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}