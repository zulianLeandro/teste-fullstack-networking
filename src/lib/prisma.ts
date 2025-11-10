// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Declara uma variável global para o Prisma
declare global {
  var prisma: PrismaClient | undefined;
}

// Lógica do Singleton:
// 1. Tenta usar o 'prisma' global se já existir
// 2. Se não existir, cria um novo PrismaClient
// 3. Em ambiente de desenvolvimento (process.env.NODE_ENV !== 'production'),
//    armazena o novo cliente no global. Isso evita criar novos clientes
//    a cada "hot reload" do Next.js.
export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}