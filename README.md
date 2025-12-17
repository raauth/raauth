# RAAuth - Portal de Dashboards Power BI

Uma implementação open source para hospedar e gerenciar dashboards Power BI da empresa **Amper Elinsa**. Este projeto fornece uma solução completa de autenticação, autorização e gerenciamento de acesso a relatórios e painéis de Business Intelligence.

## 🚀 Tecnologias

Este projeto foi construído utilizando as seguintes tecnologias:

### Core

- **[Next.js 16](https://nextjs.org)** - Framework React para produção
- **[React 19](https://react.dev)** - Biblioteca para interfaces de usuário
- **[TypeScript](https://www.typescriptlang.org)** - Superset tipado de JavaScript

### Banco de Dados & ORM

- **[Prisma](https://www.prisma.io)** - ORM moderno para Node.js e TypeScript
- **[PostgreSQL](https://postgresql.org)** - Banco de dados relacional

### Autenticação & Autorização

- **[Better Auth](https://www.better-auth.com)** - Solução de autenticação moderna e segura

### UI & Estilização

- **[Tailwind CSS 4](https://tailwindcss.com)** - Framework CSS utility-first
- **[Radix UI](https://www.radix-ui.com)** - Componentes primitivos acessíveis
- **[Lucide React](https://lucide.dev)** - Ícones modernos
- **[Sonner](https://sonner.emilkowal.ski)** - Notificações toast elegantes

### Formulários & Validação

- **[React Hook Form](https://react-hook-form.com)** - Formulários performáticos
- **[Zod](https://zod.dev)** - Validação de schemas TypeScript-first

### Tabelas & Dados

- **[TanStack Table](https://tanstack.com/table)** - Tabelas headless e poderosas

### E-mail

- **[React Email](https://react.email)** - Componentes de e-mail com React
- **[Resend](https://resend.com)** - Serviço de envio de e-mails

## ✨ Funcionalidades

- 🔐 **Autenticação segura** com múltiplos providers
- 👥 **Gerenciamento de organizações** com múltiplos usuários
- 📊 **Integração com Power BI** via iframe embedding
- 🎯 **Controle de acesso por roles** (Admin, Membro, Convidado)
- 📱 **Interface responsiva** e moderna
- 🌙 **Tema claro/escuro** com next-themes

## 🛠️ Começando

### Pré-requisitos

- Node.js 18+
- PostgreSQL
- npm, yarn, pnpm ou bun

### Instalação

1. Clone o repositório:

```bash
git clone https://github.com/amper-elinsa/raauth.git
cd raauth
```

2. Instale as dependências:

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

4. Execute as migrações do banco de dados:

```bash
npm run db:migrate
```

5. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📦 Scripts Disponíveis

| Script               | Descrição                            |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Inicia o servidor de desenvolvimento |
| `npm run build`      | Gera o build de produção             |
| `npm run start`      | Inicia o servidor de produção        |
| `npm run lint`       | Executa o linter                     |
| `npm run db:client`  | Gera o client do Prisma              |
| `npm run db:migrate` | Executa as migrações do banco        |
| `npm run db:studio`  | Abre o Prisma Studio                 |
| `npm run dev:e`      | Inicia o preview de e-mails          |

## 📁 Estrutura do Projeto

```
raauth/
├── app/                    # App Router do Next.js
│   ├── (main)/            # Rotas principais (com layout)
│   ├── (dashboards)/      # Rotas de dashboards Power BI
│   └── api/               # API Routes
├── components/            # Componentes React reutilizáveis
├── lib/                   # Utilitários e configurações
├── prisma/                # Schema e migrações do banco
└── emails/                # Templates de e-mail
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📄 Licença

Este projeto é open source e está disponível sob a licença MIT.

---

Desenvolvido com ❤️ pela equipe **Amper Elinsa**
