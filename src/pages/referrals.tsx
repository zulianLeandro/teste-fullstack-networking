// src/pages/referrals.tsx
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { prisma } from '@/lib/prisma';
import { User } from '@prisma/client';
import { useState, FormEvent } from 'react';
import useSWR from 'swr';
import { ReferralList } from '@/components/features/ReferralList';

// Componentes do Shadcn
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ReferralsPageProps {
  allUsers: User[];
}

const ReferralsPage: NextPage<ReferralsPageProps> = ({ allUsers }) => {
  // Estados do Formulário
  const [receivedById, setReceivedById] = useState('');
  const [description, setDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [formStatus, setFormStatus] = useState<'idle' | 'loading'>('idle');

  // Busca de Dados (SWR)
  const { data, error, mutate } = useSWR('/api/referrals', fetcher);

  // Lógica de Criar Indicação (continua a mesma)
  const handleCreateReferral = async (e: FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');
    try {
      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receivedById, description, contactInfo }),
      });
      if (response.ok) {
        setReceivedById('');
        setDescription('');
        setContactInfo('');
        mutate();
      } else {
        alert('Falha ao criar indicação.');
      }
    } catch (error) {
      alert('Erro de rede.');
    } finally {
      setFormStatus('idle');
    }
  };

  // Renderização
  return (
    <>
      <Head>
        <title>Minhas Indicações</title>
      </Head>
      <main className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">
            Gerenciador de Indicações
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna 1: Criar Nova Indicação */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Nova Indicação</CardTitle>
                  <CardDescription>
                    Envie uma oportunidade para outro membro.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handleCreateReferral}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="receivedById">
                        Indicar para o Membro:
                      </Label>
                      {/* Dropdown <Select> do Shadcn */}
                      <Select
                        value={receivedById}
                        onValueChange={setReceivedById}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um membro" />
                        </SelectTrigger>
                        <SelectContent>
                          {allUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} - ({user.company})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactInfo">
                        Empresa/Contato Indicado:
                      </Label>
                      <Input
                        id="contactInfo"
                        type="text"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Descrição da Oportunidade:
                      </Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows={3}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={formStatus === 'loading'}
                      className="w-full"
                    >
                      {formStatus === 'loading' ? 'Enviando...' : 'Enviar Indicação'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Coluna 2: Listas de Indicações */}
            <div className="lg:col-span-2 space-y-6">
              {error && <p>Erro ao carregar indicações.</p>}
              {!data && !error && <p>Carregando indicações...</p>}
              {data && (
                <>
                  {/* Lista de Enviadas */}
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">
                      Indicações Enviadas
                    </h2>
                    <ReferralList
                      referrals={data.sent}
                      type="sent"
                      onStatusChange={mutate}
                    />
                  </div>
                  
                  <Separator className="my-6" />

                  {/* Lista de Recebidas */}
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">
                      Indicações Recebidas
                    </h2>
                    <ReferralList
                      referrals={data.received}
                      type="received"
                      onStatusChange={mutate}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

// A lógica de getServerSideProps continua 100% a mesma
export const getServerSideProps: GetServerSideProps = async (context) => {
  // TODO: Adicionar a mesma proteção de ?secret=...
  // da página de Admin para simular um "login"

  const allUsers = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, company: true },
  });

  return {
    props: {
      allUsers,
    },
  };
};

export default ReferralsPage;