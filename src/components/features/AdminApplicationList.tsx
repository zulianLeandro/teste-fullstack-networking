// src/components/features/AdminApplicationList.tsx
import { useState } from 'react';
import { Application, ApplicationStatus } from '@prisma/client';

// Componentes do Shadcn
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button'; // Já temos o botão

type ApplicationWithDateAsString = Omit<Application, 'createdAt'> & {
  createdAt: string;
};

interface AdminApplicationListProps {
  initialApplications: ApplicationWithDateAsString[];
}

export const AdminApplicationList = ({
  initialApplications,
}: AdminApplicationListProps) => {
  const [applications, setApplications] = useState(initialApplications);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    setLoadingId(id);
    try {
      const response = await fetch(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        const updatedApplication = await response.json();
        setApplications((prev) =>
          prev.map((app) =>
            app.id === id
              ? { ...app, status: updatedApplication.status }
              : app
          )
        );
      } else {
        alert('Falha ao atualizar o status.');
      }
    } catch (error) {
      alert('Erro de rede.');
    } finally {
      setLoadingId(null);
    }
  };

  // 1. Renderização refeita com <Table>
  return (
    <Table>
      <TableCaption>
        {applications.length === 0
          ? 'Nenhuma intenção de participação encontrada.'
          : 'Lista de todas as intenções de participação.'}
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead>Razão</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((app) => (
          <TableRow key={app.id}>
            <TableCell>
              {new Date(app.createdAt).toLocaleDateString('pt-BR')}
            </TableCell>
            <TableCell>{app.name}</TableCell>
            <TableCell>{app.company}</TableCell>
            <TableCell className="max-w-xs truncate" title={app.reason}>
              {app.reason}
            </TableCell>
            <TableCell>
              {/* 2. Usando o <Badge> */}
              <Badge
                variant={
                  app.status === 'APPROVED'
                    ? 'default' // Verde (no tema padrão)
                    : app.status === 'REJECTED'
                    ? 'destructive' // Vermelho
                    : 'secondary' // Cinza/Amarelo
                }
                className={app.status === 'APPROVED' ? 'bg-green-600' : ''}
              >
                {app.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {app.status === 'PENDING' && (
                <div className="flex justify-end space-x-2">
                  {/* 3. Usando o <Button> */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(app.id, 'APPROVE')}
                    disabled={loadingId === app.id}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Aprovar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleAction(app.id, 'REJECT')}
                    disabled={loadingId === app.id}
                  >
                    Recusar
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};