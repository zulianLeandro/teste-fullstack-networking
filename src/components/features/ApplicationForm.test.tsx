// src/components/features/ApplicationForm.tsx
import { useState, FormEvent } from 'react';

// Importando os componentes "lindos" do shadcn/ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Tipos (continuam os mesmos)
interface FormData {
  name: string;
  email: string;
  company: string;
  reason: string;
}
type Status = 'idle' | 'loading' | 'success' | 'error';

export const ApplicationForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    reason: '',
  });
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // A lógica de handleSubmit continua 100% a mesma
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', company: '', reason: '' });
      } else {
        const data = await response.json();
        setErrorMessage(data.error || 'Ocorreu um erro.');
        setStatus('error');
      }
    } catch (error) {
      setErrorMessage('Não foi possível conectar ao servidor.');
      setStatus('error');
    }
  };

  // Feedback de Sucesso (agora usa classes do shadcn)
  if (status === 'success') {
    return (
      <div className="text-center p-4 bg-green-100 text-green-800 rounded-md">
        <h3 className="font-bold">Inscrição enviada com sucesso!</h3>
        <p>Entraremos em contato em breve.</p>
      </div>
    );
  }

  // 8. O Formulário (Renderização REFEITA com shadcn)
  return (
    // Note como os 'className' feios sumiram
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome Completo</Label>
        <Input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="company">Empresa</Label>
        <Input
          type="text"
          name="company"
          id="company"
          value={formData.company}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reason">Por que você quer participar?</Label>
        <Textarea
          name="reason"
          id="reason"
          value={formData.reason}
          onChange={handleChange}
          required
          rows={4}
        />
      </div>

      <div>
        <Button
          type="submit"
          disabled={status === 'loading'}
          className="w-full" // A única classe de layout que precisamos
        >
          {status === 'loading' ? 'Enviando...' : 'Enviar Intenção'}
        </Button>
      </div>

      {status === 'error' && (
        // 'text-destructive' é uma cor de "erro" que vem do shadcn
        <div className="text-destructive font-medium text-center">
          {errorMessage}
        </div>
      )}
    </form>
  );
};