// src/pages/api/applications.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma'; // Importando nosso "gerente" Prisma

// O 'handler' é a função que o Next.js vai chamar
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Blindagem do Método (Crucial!)
  // Só aceitamos requisições do tipo POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']); // Informa ao navegador quais métodos são permitidos
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // 2. Extração e Validação dos Dados
  const { name, email, company, reason } = req.body;

  // Validação simples (para o teste, isso é fundamental)
  if (!name || !email || !company || !reason) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  // 3. Lógica de Negócio (Salvar no Banco)
  try {
    const newApplication = await prisma.application.create({
      data: {
        name: name,
        email: email,
        company: company,
        reason: reason,
        // O 'status' PENDING é o default, conforme nosso schema
      },
    });

    // 4. Resposta de Sucesso
    // Retornamos 201 (Created) e o objeto que foi criado
    return res.status(201).json(newApplication);
  } catch (error) {
    // 5. Tratamento de Erro
    console.error('Erro ao criar aplicação:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}