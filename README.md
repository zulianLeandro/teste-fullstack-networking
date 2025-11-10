# Teste Técnico - Plataforma de Gestão de Networking

Este é o projeto de implementação para o teste técnico de Desenvolvedor Fullstack.

O projeto utiliza **Next.js** em modo híbrido (Pages Router para as páginas e API, e App Router para a estrutura base de estilos), **PostgreSQL** com **Prisma** como ORM, e **TailwindCSS** com **shadcn/ui** para o "theme" e componentes.

## 📄 Documentação

Todo o planejamento e desenho da arquitetura podem ser encontrados no arquivo [ARQUITETURA.md](ARQUITETURA.md).

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

* [Node.js](https://nodejs.org/) (v18 ou superior)
* [Git](https://git-scm.com/)
* [Docker](https://www.docker.com/products/docker-desktop/) (para o banco de dados)

---

### 1. Setup Inicial

1.  **Clone o Repositório**
    ```bash
    git clone [URL_DO_SEU_REPOSITORIO]
    cd teste-fullstack-networking
    ```

2.  **Instale as Dependências**
    ```bash
    npm install
    ```

3.  **Configure o Ambiente**
    * Crie um arquivo `.env` na raiz do projeto (copiando do `.env.example`, se existir, ou criando do zero).
    * Adicione as seguintes variáveis:

    ```env
    # String de conexão do Banco de Dados (ajuste a porta/senha se necessário)
    DATABASE_URL="postgresql://postgres:1234@localhost:5433/postgres"

    # Chave secreta para a área de admin
    ADMIN_SECRET_KEY="minhasenhasecreta123"
    ```

### 2. Banco de Dados (Docker + Prisma)

1.  **Inicie o Contêiner do Banco (Docker)**
    * Certifique-se de que o Docker Desktop está rodando.
    * *Nota: Este comando usa a porta `5433` local para evitar conflitos com a `5432` padrão.*
    ```bash
    docker run --name teste-postgres -e POSTGRES_PASSWORD=1234 -p 5433:5432 -d postgres:15
    ```

2.  **Aplique as Migrations do Prisma**
    * Este comando vai ler o `prisma/schema.prisma` e criar todas as tabelas no banco:
    ```bash
    npx prisma migrate dev
    ```

### 3. Configuração do Theme (Shadcn/ui)

O projeto usa `shadcn/ui`. Os componentes já estão no repositório, mas se você precisar adicionar novos componentes, o `shadcn` precisa ser inicializado e as dependências de animação instaladas:

1.  **Instale o Plugin de Animação** (Necessário para o `tailwind.config.ts`):
    ```bash
    npm install tailwindcss-animate
    ```

2.  **Inicialize o Shadcn** (Se for rodar pela primeira vez):
    ```bash
    npx shadcn@latest init
    ```
    *(Siga as instruções do prompt, apontando para `src/app/globals.css` e `tailwind.config.ts`)*

3.  **Adicione Componentes** (Exemplo de como adicionar novos):
    ```bash
    npx shadcn@latest add button
    npx shadcn@latest add card
    ```

### 4. Rodando o Projeto

1.  **Inicie o Servidor de Desenvolvimento**
    ```bash
    npm run dev
    ```

2.  **Acesse as Páginas:**
    * **Página de Intenção:** [http://localhost:3000/apply](http://localhost:3000/apply)
    * **Área do Admin:** [http://localhost:3000/admin/applications?secret=minhasenhasecreta123](http://localhost:3000/admin/applications?secret=minhasenhasecreta123)
    * **Página de Indicações (Simulada):** [http://localhost:3000/referrals](http://localhost:3000/referrals)

---

## 🧪 Como Rodar os Testes

Este projeto usa Jest e React Testing Library para testes unitários de componentes.

```bash
npm test