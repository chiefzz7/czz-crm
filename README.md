<h1 align="center">
  CZZ CRM — Sales Pipeline
</h1>

<p align="center">
  CRM de Vendas de Cursos construído para times de alta performance.<br/>
  Gerencie leads, pipeline Kanban, cursos e métricas de conversão em tempo real.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-0.141-009688?style=flat-square&logo=fastapi" />
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python" />
</p>

---

## ✨ Features

- 🔐 **Autenticação JWT** com access + refresh token rotacionado
- 📋 **Gestão de Leads** com funil de vendas e transições de status validadas
- 🗂️ **Kanban Board** com drag-and-drop para mover leads entre estágios
- 📊 **Dashboard** com métricas de conversão, receita e pipeline em tempo real
- 🎓 **Catálogo de Cursos** com CRUD completo
- 📝 **Histórico de Interações** por lead
- 🛡️ **Segurança Enterprise**: Rate limiting, CSP, CORS estrito, security headers
- 🏗️ **Arquitetura limpa**: separação em rotas → services → data store

---

## 🗂️ Estrutura do Projeto

```
crm-czz/
├── backend/                  # FastAPI + Python 3.12
│   ├── app/
│   │   ├── api/v1/          # Endpoints versionados
│   │   ├── core/            # Config, segurança, exceções
│   │   ├── data/            # Mock store (pré-Supabase)
│   │   ├── middlewares/     # Security headers, Request ID
│   │   ├── schemas/         # Pydantic models (request/response)
│   │   └── services/        # Lógica de negócio
│   ├── main.py              # App factory
│   └── requirements.txt
│
└── frontend/                 # Next.js 16 + TypeScript
    └── src/
        ├── app/             # App Router (pages)
        ├── features/        # Componentes por domínio
        ├── components/ui/   # UI genérica reutilizável
        └── services/        # Axios instance centralizada
```

---

## 🚀 Como Rodar

### Backend (FastAPI)

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

> Swagger UI disponível em: http://localhost:8000/docs

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

> App disponível em: http://localhost:3000

### Variáveis de Ambiente

Copie `.env.example` → `.env` na raiz e preencha:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
JWT_SECRET_KEY=...         # openssl rand -hex 64
JWT_REFRESH_SECRET_KEY=... # openssl rand -hex 64
```

---

## 🔑 Acesso Demo

| Campo  | Valor                  |
|--------|------------------------|
| E-mail | `admin@czztech.com`    |
| Senha  | `admin123`             |

> ⚠️ Dados mock em memória. Integração com Supabase em desenvolvimento.

---

## 🧪 Stack Técnica

| Camada       | Tecnologia                                      |
|--------------|-------------------------------------------------|
| Backend      | Python 3.12, FastAPI, SQLModel, asyncpg         |
| Frontend     | Next.js 16, TypeScript, Tailwind CSS v4         |
| Banco        | Supabase (PostgreSQL + RLS)                     |
| Auth         | JWT (python-jose) + bcrypt                      |
| UI           | Lucide React, Recharts, @hello-pangea/dnd       |
| Estado       | Zustand + TanStack Query                        |
| Forms        | React Hook Form + Zod                           |
| Rate Limit   | slowapi                                         |

---

## 📄 Licença

Proprietário — © 2026 Samuel Ramos. Todos os direitos reservados.
