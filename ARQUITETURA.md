# Documento de Arquitetura: Plataforma de Gestão de Networking

Este documento detalha a arquitetura e o planejamento técnico para a plataforma de gestão de grupos de networking, conforme solicitado no Teste Técnico.

## [cite_start]1. Diagrama da Arquitetura [cite: 34]

O sistema será uma aplicação web monolítica ("Monorepo") baseada em **Next.js**. Esta abordagem simplifica o desenvolvimento e o *deploy*, mantendo o Frontend e o Backend no mesmo projeto, mas logicamente separados.

A comunicação se dará da seguinte forma:
1.  O **Usuário** (Membro ou Admin) acessa o **Frontend (Next.js/React)** no seu navegador.
2.  O Frontend (cliente) faz chamadas HTTP (Fetch/Axios) para o **Backend (Next.js API Routes)**.
3.  O Backend processa a lógica de negócio e se comunica com o **Banco de Dados (PostgreSQL)** para persistir e consultar dados.

### Diagrama (Mermaid)

```mermaid
graph TD
    A[Usuário (Browser)] --> B(Frontend <br> Next.js/React);
    B --> C{Backend <br> Next.js API Routes};
    C --> D[(Database <br> PostgreSQL)];
```

## [cite_start]2. Modelo de Dados [cite: 35]

### [cite_start]Escolha do Banco de Dados: PostgreSQL [cite: 45]

**Justificativa:** Optei pelo **PostgreSQL** por ser um banco de dados relacional (SQL) robusto, escalável e com forte integridade referencial. [cite_start]As funcionalidades do sistema (membros, indicações, reuniões, pagamentos) [cite: 16-32] possuem relacionamentos claros entre si (ex: um `Membro` faz várias `Indicações`; uma `Indicação` tem um status), que são gerenciados de forma mais segura e eficiente por um modelo relacional.

### Esquema do Banco de Dados (Schema)

[cite_start]Abaixo está o esquema de dados proposto (em sintaxe de Prisma ORM) para suportar todas as funcionalidades listadas[cite: 15].

```prisma
// Enumerações para controle de status
enum ApplicationStatus {
  PENDING
  APPROVED
  REJECTED
}

enum ReferralStatus {
  SENT
  NEGOTIATING
  CLOSED
  REJECTED
}

enum PaymentStatus {
  PENDING
  PAID
  OVERDUE
}

[cite_start]// 1. Gestão de Membros [cite: 16] [cite_start]e 5. Financeiro [cite: 31]
model User {
  id        String    @id @default(uuid())
  name      String
  email     String    @unique
  company   String
  [cite_start]// ... outros campos do cadastro completo [cite: 19]
  [cite_start]isActive  Boolean   @default(true) // (para dashboard [cite: 65])
  createdAt DateTime  @default(now())
  
  // Relacionamentos
  application     Application? @relation(fields: [applicationId], references: [id]) // A intenção que o originou
  applicationId   String?      @unique
  [cite_start]sentReferrals   Referral[]   @relation("SentBy")   // Indicações feitas [cite: 24]
  [cite_start]receivedReferrals Referral[] @relation("ReceivedBy") // Indicações recebidas [cite: 24]
  [cite_start]meetingsAsP1    Meeting[]    @relation("Participant1") // Reuniões 1-a-1 [cite: 28]
  [cite_start]meetingsAsP2    Meeting[]    @relation("Participant2") // Reuniões 1-a-1 [cite: 28]
  [cite_start]thanks          Thank[]      // "Obrigados" registrados [cite: 26]
  [cite_start]payments        Payment[]    // Mensalidades [cite: 32]
  [cite_start]checkins        CheckIn[]    // Presença em reuniões [cite: 22]
}

// 1.a. [cite_start]Formulário de Intenção [cite: 17]
model Application {
  id        String   @id @default(uuid())
  name      String
  email     String
  company   String
  [cite_start]reason    String   // "Por que você quer participar?" [cite: 49]
  status    ApplicationStatus @default(PENDING)
  createdAt DateTime @default(now())
  
  user      User?    // O usuário que será criado a partir daqui
  invite    Invite?  [cite_start]// O convite gerado [cite: 53]
}

// 1.c. [cite_start]Token de Convite para Cadastro [cite: 53]
model Invite {
  id          String    @id @default(uuid())
  token       String    @unique
  expiresAt   DateTime
  isUsed      Boolean   @default(false)
  createdAt   DateTime  @default(now())
  
  application   Application @relation(fields: [applicationId], references: [id])
  applicationId String      @unique
}

[cite_start]// 3. Geração de Negócios [cite: 23]
model Referral {
  id          String   @id @default(uuid())
  [cite_start]description String   // Descrição da Oportunidade [cite: 60]
  [cite_start]contactInfo String   // Empresa/Contato Indicado [cite: 60]
  [cite_start]status      ReferralStatus @default(SENT) // [cite: 25]
  createdAt   DateTime @default(now())

  sentById      String // ID de quem indicou
  [cite_start]receivedById  String // ID de quem foi indicado [cite: 60]

  sentBy      User @relation("SentBy", fields: [sentById], references: [id])
  receivedBy  User @relation("ReceivedBy", fields: [receivedById], references: [id])
}

// 3.c. [cite_start]"Obrigados" [cite: 26]
model Thank {
  id        String   @id @default(uuid())
  description String
  amount    Float?   // Valor (opcional, mas comum)
  createdAt DateTime @default(now())
  
  userId String
  user   User   @relation(fields: [userId], references: [id])
}

[cite_start]// 4. Acompanhamento [cite: 27]
model Meeting {
  id        String   @id @default(uuid())
  date      DateTime
  notes     String?
  createdAt DateTime @default(now())

  participant1Id String
  participant2Id String
  
  participant1 User @relation("Participant1", fields: [participant1Id], references: [id])
  participant2 User @relation("Participant2", fields: [participant2Id], references: [id])
}

[cite_start]// 2. Comunicação e Engajamento [cite: 20]
model CheckIn {
  id        String   @id @default(uuid())
  meetingDate DateTime
  createdAt DateTime @default(now())

  userId String
  user   User   @relation(fields: [userId], references: [id])
}

model Announcement {
  id        String   @id @default(uuid())
  title     String
  content   String
  createdAt DateTime @default(now())
}

[cite_start]// 5. Financeiro [cite: 31]
model Payment {
  id         String        @id @default(uuid())
  amount     Float
  dueDate    DateTime
  status     PaymentStatus @default(PENDING)
  createdAt  DateTime      @default(now())
  
  userId String
  user   User   @relation(fields: [userId], references: [id])
}

```

## [cite_start]3. Estrutura de Componentes (Frontend) [cite: 37]

A estrutura de pastas do **React/Next.js** será organizada na pasta `src/` para promover reuso e separação de conceitos.

```
src/
├── components/
│   ├── ui/         # Componentes de UI "burros" e reutilizáveis (Button, Input, Card, Modal)
│   ├── features/   # Componentes complexos com lógica (Ex: ApplicationForm, ReferralList)
│   └── layouts/    # Estrutura da página (Ex: AdminLayout, PublicLayout)
│
├── hooks/          # Hooks customizados (Ex: useUser, useApplications)
│
├── lib/            # Funções utilitárias, helpers, instância do Prisma Client
│
├── pages/          # Rotas do Next.js (Frontend)
│   ├── index.tsx
│   ├── apply.tsx                 # [Módulo Obrigatório - 1] [cite: 49]
│   ├── register.tsx              # [Módulo Obrigatório - 3] [cite: 54]
│   ├── admin/
│   │   └── applications.tsx      # [Módulo Obrigatório - 2] [cite: 50]
│   ├── dashboard.tsx             # [Opcional B] [cite: 63]
│   └── referrals.tsx             # [Opcional A] [cite: 58]
│
└── pages/api/      # Rotas do Next.js (Backend) [cite: 44]
    ├── applications.ts           # POST (criar intenção)
    ├── admin/
    │   └── applications/
    │       ├── index.ts          # GET (listar intenções)
    │       └── [id].ts           # PATCH (aprovar/recusar)
    └── referrals.ts              # POST, GET, PATCH (indicações)
```

## [cite_start]4. Definição da API [cite: 38]

[cite_start]Conforme solicitado [cite: 39][cite_start], abaixo estão as especificações para 3 funcionalidades-chave, baseadas no **Módulo Obrigatório: Fluxo de Admissão de Membros**[cite: 47].

---

### 1. Criar Intenção de Participação

* [cite_start]**Funcionalidade:** Formulário público de intenção[cite: 17, 49].
* **Rota:** `POST /api/applications`
* **Request Body:**
    ```json
    {
      "name": "Candidato Exemplo",
      "email": "candidato@email.com",
      "company": "Empresa S/A",
      "reason": "Gostaria de expandir meu networking."
    }
    ```
* **Response (Sucesso 201):**
    ```json
    {
      "id": "clx123abc",
      "name": "Candidato Exemplo",
      "email": "candidato@email.com",
      "status": "PENDING",
      "createdAt": "2025-11-09T20:00:00.000Z"
    }
    ```
* **Response (Erro 400 - Validação):**
    ```json
    { "error": "O campo 'email' é obrigatório." }
    ```

---

### 2. Listar Intenções (Admin)

* [cite_start]**Funcionalidade:** Área de gestão para administradores verem intenções[cite: 18, 51].
* **Rota:** `GET /api/admin/applications`
* **Request Body:** (Nenhum)
* **Response (Sucesso 200):**
    ```json
    [
      {
        "id": "clx123abc",
        "name": "Candidato Exemplo",
        "email": "candidato@email.com",
        "company": "Empresa S/A",
        "status": "PENDING",
        "createdAt": "2025-11-09T20:00:00.000Z"
      },
      {
        "id": "clx456def",
        "name": "Outra Candidata",
        "email": "outra@email.com",
        "company": "Startup XYZ",
        "status": "APPROVED",
        "createdAt": "2025-11-08T10:00:00.000Z"
      }
    ]
    ```

---

### 3. Aprovar ou Recusar Intenção (Admin)

* [cite_start]**Funcionalidade:** Administradores aprovarem/recusarem intenções[cite: 18, 52].
* **Rota:** `PATCH /api/admin/applications/[id]` (Ex: `/api/admin/applications/clx123abc`)
* **Request Body:**
    ```json
    {
      "action": "APPROVE"
    }
    ```
    *(Onde `action` pode ser `"APPROVE"` ou `"REJECT"`)*
* **Response (Sucesso 200):**
    ```json
    {
      "id": "clx123abc",
      "status": "APPROVED",
      "message": "Convite gerado e logado no console."
    }
    ```
* **Response (Erro 404 - Não Encontrado):**
    ```json
    { "error": "Aplicação não encontrada." }
    ```