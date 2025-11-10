// src/pages/register.tsx
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { prisma } from '@/lib/prisma';
import { Application } from '@prisma/client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';

// Componentes do Shadcn
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Tipo serializado (como estava antes)
type ApplicationWithDateAsString = Omit<Application, 'createdAt'> & {
  createdAt: string;
};

interface RegisterPageProps {
  token: string;
  application: ApplicationWithDateAsString;
  error?: string;
}

const RegisterPage: NextPage<RegisterPageProps> = ({
  token,
  application,
  error,
}) => {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  );
  const [errorMessage, setErrorMessage] = useState('');

  // A lógica de handleSubmit continua 100% a mesma
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password,
          name: application.name,
          email: application.email,
          company: application.company,
        }),
      });

      if (response.ok) {
        setStatus('success');
        setTimeout(() => {
          router.push('/dashboard-placeholder');
        }, 3000);
      } else {
        const data = await response.json();
        setErrorMessage(data.error || 'Falha no cadastro.');
        setStatus('error');
      }
    } catch (error) {
      setErrorMessage('Erro de conexão.');
      setStatus('error');
    }
  };

  // 1. Tratamento de Erro (Token Inválido) - Agora com Card
  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">
              Link de Convite Inválido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive-foreground">{error}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  // 2. Mensagem de Sucesso - Agora com Card
  if (status === 'success') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md bg-green-100 border-green-300">
          <CardHeader>
            <CardTitle className="text-green-800">
              Cadastro Concluído!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">
              Seja bem-vindo(a), {application.name}. Você será redirecionado...
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  // 3. O Formulário de Cadastro (Refeito com Card)
  return (
    <>
      <Head>
        <title>Complete seu Cadastro</title>
      </Head>
      <main className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Complete seu Cadastro</CardTitle>
            <CardDescription>
              Olá, {application.name}. Estamos quase lá!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campos pré-preenchidos */}
              <div className="space-y-2 rounded-md border p-4 bg-muted/50">
                <div className="flex justify-between">
                  <Label>Nome</Label>
                  <span className="text-sm text-muted-foreground">
                    {application.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <Label>Email</Label>
                  <span className="text-sm text-muted-foreground">
                    {application.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <Label>Empresa</Label>
                  <span className="text-sm text-muted-foreground">
                    {application.company}
                  </span>
                </div>
              </div>

              {/* Campo novo */}
              <div className="space-y-2">
                <Label htmlFor="password">Crie uma Senha</Label>
                <Input
                  type="password"
                  name="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {status === 'error' && (
                <div className="text-destructive font-medium text-center">
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                disabled={status === 'loading'}
                className="w-full"
              >
                {status === 'loading'
                  ? 'Finalizando...'
                  : 'Finalizar Cadastro'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

// A lógica de getServerSideProps continua 100% a mesma
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { token } = context.query;

  if (!token || typeof token !== 'string') {
    return { props: { error: 'Token não fornecido.' } };
  }

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: {
      application: true,
    },
  });

  if (!invite) {
    return { props: { error: 'Token de convite não encontrado.' } };
  }
  if (invite.isUsed) {
    return { props: { error: 'Este convite já foi utilizado.' } };
  }
  if (invite.expiresAt < new Date()) {
    return { props: { error: 'Este convite expirou.' } };
  }

  const serializableApplication = {
    ...invite.application,
    createdAt: invite.application.createdAt.toISOString(),
  };

  return {
    props: {
      token: token,
      application: serializableApplication,
    },
  };
};

export default RegisterPage;