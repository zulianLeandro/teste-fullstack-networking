// src/pages/admin/applications.tsx
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { Application } from '@prisma/client';
import { AdminApplicationList } from '@/components/features/AdminApplicationList';
import { prisma } from '@/lib/prisma'; // Precisamos do prisma no servidor

// Reutilizando o tipo que criamos no componente
type ApplicationWithDateAsString = Omit<Application, 'createdAt'> & {
  createdAt: string;
};

// Props que a página receberá
interface AdminPageProps {
  applications: ApplicationWithDateAsString[];
}

const AdminPage: NextPage<AdminPageProps> = ({ applications }) => {
  return (
    <>
      <Head>
        <title>Admin - Intenções</title>
      </Head>
      {/* Layout simples com Tailwind */}
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6">
            Gestão de Intenções de Participação
          </h1>
          <AdminApplicationList initialApplications={applications} />
        </div>
      </main>
    </>
  );
};

// 3. Busca de Dados (Server-Side Rendering)
// Esta função roda no SERVIDOR antes da página ser enviada ao usuário
export const getServerSideProps: GetServerSideProps = async (context) => {
  // 4. SEGURANÇA BÁSICA (Conforme item 50 do teste)
  // Vamos proteger esta página com uma variável de ambiente
  const { secret } = context.query; // Pega ?secret=... da URL
  const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY;

  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    // Se a chave estiver errada, redireciona para a home
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  // Se a chave estiver CORRETA, busca os dados no banco
  const applications = await prisma.application.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Precisamos converter 'Date' para 'string'
  // pois o JSON não transporta objetos Date entre servidor e cliente
  const serializedApplications = applications.map((app) => ({
    ...app,
    createdAt: app.createdAt.toISOString(),
  }));

  // Envia os dados como props para a página
  return {
    props: {
      applications: serializedApplications,
    },
  };
};

export default AdminPage;