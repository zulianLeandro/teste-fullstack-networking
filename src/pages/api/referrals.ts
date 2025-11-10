// src/pages/api/referrals.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { ReferralStatus } from '@prisma/client';

// *** SIMULAÇÃO DE LOGIN ***
// Em um app real, pegaríamos o ID do usuário da sessão/token JWT
// Para o teste, vamos usar um ID fixo.
// Vá no DBeaver, copie o ID de um usuário da tabela 'User' e cole aqui:
const FAKE_LOGGED_IN_USER_ID = 'a3d265cb-6032-4e7e-be0a-b0a4b253fa19'; 
// Ex: 'a1b2c3d4-...'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (FAKE_LOGGED_IN_USER_ID === 'COLE_SEU_USER_ID_AQUI') {
    return res.status(500).json({
      error:
        "Erro de Configuração: Defina o 'FAKE_LOGGED_IN_USER_ID' no topo de '/api/referrals.ts'",
    });
  }

  // --- Roteamento baseado no Método HTTP ---

  // 1. CRIAR UMA NOVA INDICAÇÃO
  if (req.method === 'POST') {
    const { receivedById, description, contactInfo } = req.body;

    if (!receivedById || !description || !contactInfo) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
    }

    const newReferral = await prisma.referral.create({
      data: {
        description,
        contactInfo,
        sentById: FAKE_LOGGED_IN_USER_ID, // Nosso usuário "logado"
        receivedById: receivedById,         // O membro que ele indicou
      },
    });
    return res.status(201).json(newReferral);
  }

  // 2. LISTAR MINHAS INDICAÇÕES
  if (req.method === 'GET') {
    // Lista as que eu ENVIEI
    const sentReferrals = await prisma.referral.findMany({
      where: { sentById: FAKE_LOGGED_IN_USER_ID },
      include: { receivedBy: { select: { name: true } } }, // Pega o nome de quem recebeu
      orderBy: { createdAt: 'desc' },
    });

    // Lista as que eu RECEBI
    const receivedReferrals = await prisma.referral.findMany({
      where: { receivedById: FAKE_LOGGED_IN_USER_ID },
      include: { sentBy: { select: { name: true } } }, // Pega o nome de quem enviou
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ sent: sentReferrals, received: receivedReferrals });
  }

  // 3. ATUALIZAR STATUS DE UMA INDICAÇÃO
  if (req.method === 'PATCH') {
    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: 'ID e Status são obrigatórios.' });
    }

    // Valida se o status é um dos permitidos no Enum
    if (!Object.values(ReferralStatus).includes(status)) {
       return res.status(400).json({ error: 'Status inválido.' });
    }

    // TODO: Em um app real, checaríamos se o usuário logado
    // é o 'sentBy' ou 'receivedBy' antes de permitir a atualização.

    const updatedReferral = await prisma.referral.update({
      where: { id: id },
      data: { status: status },
    });

    return res.status(200).json(updatedReferral);
  }

  // 4. Método não permitido
  res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}