// src/pages/api/register.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { token, password } = req.body;

  // 1. Validação dos dados
  if (!token || !password) {
    return res
      .status(400)
      .json({ error: 'Token e senha são obrigatórios.' });
  }

  try {
    // 2. Encontra o convite
    const invite = await prisma.invite.findUnique({
      where: { token: token },
      include: {
        application: true, // Puxa os dados da 'Application' junto
      },
    });

    // 3. Validação do Convite
    if (!invite) {
      return res.status(404).json({ error: 'Convite inválido.' });
    }
    if (invite.isUsed) {
      return res.status(400).json({ error: 'Convite já utilizado.' });
    }
    if (invite.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Convite expirado.' });
    }

    // 4. Lógica de Negócio: Criar o Usuário
    // (Em um app real, a senha seria 'hasheada' com bcrypt)
    const newUser = await prisma.user.create({
      data: {
        name: invite.application.name, // Usa os dados da aplicação
        email: invite.application.email,
        company: invite.application.company,
        applicationId: invite.applicationId,
      },
    });

    // 5. Marca o convite como usado
    await prisma.invite.update({
      where: { id: invite.id },
      data: { isUsed: true },
    });

    // 6. Resposta de Sucesso
    return res.status(201).json(newUser);
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}