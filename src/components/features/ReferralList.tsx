// src/components/features/ReferralList.tsx
import { Referral, ReferralStatus } from '@prisma/client';
import { useState } from 'react';

// Componentes do Shadcn
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Tipo (como estava antes)
type ReferralWithUser = Referral & {
  sentBy?: { name: string };
  receivedBy?: { name: string };
};

interface ReferralListProps {
  referrals: ReferralWithUser[];
  type: 'sent' | 'received';
  onStatusChange: () => void;
}

export const ReferralList = ({
  referrals,
  type,
  onStatusChange,
}: ReferralListProps) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (
    id: string,
    newStatus: ReferralStatus
  ) => {
    setLoadingId(id);
    try {
      const response = await fetch('/api/referrals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, status: newStatus }),
      });

      if (response.ok) {
        onStatusChange(); // Avisa a página pai para recarregar os dados
      } else {
        alert('Falha ao atualizar status.');
      }
    } catch (error) {
      alert('Erro de rede.');
    } finally {
      setLoadingId(null);
    }
  };

  if (referrals.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {type === 'sent'
          ? 'Nenhuma indicação enviada.'
          : 'Nenhuma indicação recebida.'}
      </p>
    );
  }

  // Renderiza cada indicação como um Card
  return (
    <div className="space-y-3">
      {referrals.map((ref) => (
        <Card key={ref.id}>
          <CardHeader className="flex flex-row justify-between items-start p-4">
            <div className="space-y-1">
              <CardTitle className="text-lg">
                {/* Mostra para quem você enviou ou de quem você recebeu */}
                {type === 'sent'
                  ? `Para: ${ref.receivedBy?.name}`
                  : `De: ${ref.sentBy?.name}`}
              </CardTitle>
              <CardDescription>
                {ref.contactInfo} ({ref.description})
              </CardDescription>
            </div>
            <Badge
              variant={
                ref.status === 'CLOSED'
                  ? 'default' // Verde (no tema padrão)
                  : ref.status === 'REJECTED'
                  ? 'destructive' // Vermelho
                  : 'secondary' // Cinza/Amarelo
              }
              className={ref.status === 'CLOSED' ? 'bg-green-600' : ''}
            >
              {ref.status}
            </Badge>
          </CardHeader>
          <CardFooter className="p-4 pt-0">
            {/* Dropdown <Select> do Shadcn */}
            <Select
              value={ref.status}
              onValueChange={(newStatus) =>
                handleStatusChange(ref.id, newStatus as ReferralStatus)
              }
              disabled={loadingId === ref.id}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Mudar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SENT">Enviada</SelectItem>
                <SelectItem value="NEGOTIATING">Em Negociação</SelectItem>
                <SelectItem value="CLOSED">Fechada</SelectItem>
                <SelectItem value="REJECTED">Recusada</SelectItem>
              </SelectContent>
            </Select>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};