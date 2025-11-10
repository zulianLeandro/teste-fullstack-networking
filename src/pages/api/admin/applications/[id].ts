// src/pages/api/admin/applications/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { ApplicationStatus } from '@prisma/client';
import crypto from 'crypto'; // Importa o módulo de criptografia

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { id } = req.query;
  const { action } = req.body;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID da aplicação é inválido.' });
  }

  let newStatus: ApplicationStatus;
  if (action === 'APPROVE') {
    newStatus = ApplicationStatus.APPROVED;
  } else if (action === 'REJECT') {
    newStatus = ApplicationStatus.REJECTED;
  } else {
    return res.status(400).json({ error: 'Ação inválida.' });
  }

  try {
    // 1. Atualiza o status da 'Application'
    const updatedApplication = await prisma.application.update({
      where: {
        id: id,
      },
      data: {
        status: newStatus,
      },
    });

    // 2. LÓGICA DO CONVITE (A parte nova)
    if (action === 'APPROVE') {
      // Gera um token seguro de 32 bytes em formato hexadecimal
      const token = crypto.randomBytes(32).toString('hex');

      // Define a expiração para 7 dias
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // 3. Cria o 'Invite' no banco
      await prisma.invite.create({
        data: {
          token: token,
          expiresAt: expiresAt,
          applicationId: id, // Conecta o convite à aplicação
        },
      });

      // 4. SIMULAÇÃO DE E-MAIL (Item 55 do teste)
      // Loga o link no console do *servidor* (onde o 'npm run dev' está rodando)
      const registrationLink = `http://localhost:3000/register?token=${token}`;
      console.log('===================================');
      console.log('🎉 LINK DE CONVITE GERADO (Simulação de Email) 🎉');
      console.log(`Para: ${updatedApplication.email}`);
      console.log(`Link: ${registrationLink}`);
      console.log('===================================');
    }

    // 5. Resposta de Sucesso
    return res.status(200).json(updatedApplication);
  } catch (error) {
    console.error('Erro ao atualizar aplicação:', error);
    // Garante que se o 'invite' falhar (ex: token duplicado), o erro é pego
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}