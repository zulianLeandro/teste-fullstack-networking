# Teste Técnico - Plataforma de Gestão de Networking

Este é o projeto de implementação para o teste técnico de Desenvolvedor Fullstack, utilizando Next.js, Node.js (API Routes), PostgreSQL (com Prisma) e Jest/RTL.

## 🚀 Como Rodar o Projeto

1.  **Clone o Repositório**
    ```bash
    git clone [URL_DO_SEU_REPOSITORIO]
    cd [NOME_DA_PASTA]
    ```

2.  **Instale as Dependências**
    ```bash
    npm install
    ```

3.  **Configure o Ambiente**
    * Crie um arquivo `.env` na raiz do projeto (o `.gitignore` já está configurado para ignorá-lo).
    * Adicione sua string de conexão do PostgreSQL ao `.env`:
    ```env
    DATABASE_URL="postgresql://postgres:1234@localhost:5433/postgres"
    ```
    *(Ajuste a senha/usuário/porta se o seu setup for diferente.)*

4.  **Rode o Banco de Dados (Docker)**
    * Se ainda não estiver rodando, certifique-se de ter o Docker rodando e execute (ajuste a senha/porta se necessário):
    ```bash
    docker run --name teste-postgres -e POSTGRES_PASSWORD=1234 -p 5433:5432 -d postgres:15
    ```

5.  **Aplique as Migrations do Banco**
    * Este comando vai criar todas as tabelas no banco:
    ```bash
    npx prisma migrate dev
    ```

6.  **Rode o Projeto (Desenvolvimento)**
    ```bash
    npm run dev
    ```
    * Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🧪 Como Rodar os Testes

```bash
npm test