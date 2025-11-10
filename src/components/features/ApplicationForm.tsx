// src/components/features/ApplicationForm.tsx
import { useState, FormEvent } from 'react';

// Tipos para os dados do formulário
interface FormData {
  name: string;
  email: string;
  company: string;
  reason: string;
}

// Tipos para o estado da submissão
type Status = 'idle' | 'loading' | 'success' | 'error';

export const ApplicationForm = () => {
  // 1. Estados para os campos do formulário
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    reason: '',
  });

  // 2. Estados para o feedback do usuário
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // 3. Função para atualizar o estado
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 4. Função de Submissão (a "mágica")
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // Previne o reload da página
    setStatus('loading');
    setErrorMessage('');

    try {
      // 5. Chamada para a API que criamos
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // 6. Tratamento da Resposta
      if (response.ok) {
        setStatus('success');
        // Limpa o formulário
        setFormData({ name: '', email: '', company: '', reason: '' });
      } else {
        // Pega o erro da API (ex: "Todos os campos são obrigatórios")
        const data = await response.json();
        setErrorMessage(data.error || 'Ocorreu um erro.');
        setStatus('error');
      }
    } catch (error) {
      setErrorMessage('Não foi possível conectar ao servidor.');
      setStatus('error');
    }
  };

  // 7. Feedback de Sucesso (some após 5s)
  if (status === 'success') {
    return (
      <div className="text-center p-4 bg-green-100 text-green-800 rounded">
        <h3 className="font-bold">Inscrição enviada com sucesso!</h3>
        <p>Entraremos em contato em breve.</p>
      </div>
    );
  }

  // 8. O Formulário (Renderização)
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Usamos 'space-y-4' do Tailwind para espaçar os filhos */}
      <div>
        <label htmlFor="name" className="block font-medium">
          Nome Completo
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div>
        <label htmlFor="email" className="block font-medium">
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div>
        <label htmlFor="company" className="block font-medium">
          Empresa
        </label>
        <input
          type="text"
          name="company"
          id="company"
          value={formData.company}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div>
        <label htmlFor="reason" className="block font-medium">
          Por que você quer participar?
        </label>
        <textarea
          name="reason"
          id="reason"
          value={formData.reason}
          onChange={handleChange}
          required
          rows={4}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {status === 'loading' ? 'Enviando...' : 'Enviar Intenção'}
        </button>
      </div>

      {/* 9. Feedback de Erro */}
      {status === 'error' && (
        <div className="text-red-600 font-medium text-center">
          {errorMessage}
        </div>
      )}
    </form>
  );
};