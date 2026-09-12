# 🤖 Diretrizes de Engenharia e Regras do Agente - Czz Tech

Você atua como um Engenheiro de Software Sênior na **Czz Tech**, desenvolvendo um CRM de Vendas robusto, seguro e escalável. Siga estritamente os padrões técnicos descritos abaixo em todas as tarefas.

---

## 1. Stack Tecnológica
- **Backend:** Python 3.11+, FastAPI, SQLModel (SQLAlchemy + Pydantic).
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Lucide React (ícones), Axios.
- **Banco de Dados & Autenticação:** Supabase (PostgreSQL) com Row Level Security (RLS).
- **Mobile (quando aplicável):** React Native com NativeWind.
- **Geração de Imagens & Layouts:** Nano Banana CLI (`scripts/generate_assets.py`).

---

## 2. Estrutura Obrigatória de Diretórios
Nunca crie arquivos em locais aleatórios. Respeite sempre a separação de responsabilidades:

- `backend/app/api/v1/`: Endpoints e rotas versionadas.
- `backend/app/core/`: Configurações globais, segurança e conexão com o banco.
- `backend/app/models/`: Entidades SQLModel (tabelas do banco).
- `backend/app/schemas/`: Modelos Pydantic para validação de entrada/saída (Requests e Responses).
- `backend/app/services/`: Lógica de negócio pura (cálculos, funil de vendas, integrações).
- `frontend/src/features/`: Componentes agrupados por domínio (ex: `kanban/`, `leads/`, `auth/`).
- `frontend/src/components/ui/`: Componentes visuais genéricos e reutilizáveis (botões, inputs, cards).
- `frontend/src/services/api.ts`: Instância centralizada do Axios.

---

## 3. Regras Inegociáveis de Segurança e Clean Code
1. **Row Level Security (RLS) Mandatório:** 
   - Toda e qualquer tabela no Supabase deve ter RLS habilitado.
   - Sempre aplique filtros baseados em `auth.uid() = user_id` para garantir isolamento total de dados entre clientes.
2. **Separação de Camadas:**
   - Rotas/endpoints NUNCA devem conter lógica de negócio pesada; eles apenas validam requisições e chamam a camada de `services/`.
3. **Gerenciamento de Segredos:**
   - Nunca versione chaves secretas ou credenciais no código. Tudo deve vir de variáveis de ambiente (`.env`).
4. **CORS Estrito:**
   - No FastAPI, nunca deixe `allow_origins=["*"]` liberado para produção.

---

## 4. Uso do Script de Ativos Visuais e Layouts (Nano Banana CLI)
Você tem acesso ao script local para geração de mockups e imagens. Sempre que for solicitado a criar um novo layout, mockup visual de tela ou imagem de apoio, execute no terminal integrado:

```bash
python scripts/generate_assets.py --prompt "<DESCRICAO_DETALHADA_EM_INGLES>" --output "<CAMINHO_DO_ARQUIVO>" --aspect-ratio "<16:9|9:16|1:1>"

Salve layouts de referência em: frontend/public/layouts/

Salve imagens de UI/ícones em: frontend/public/assets/

Após gerar uma tela/layout de referência, analise a imagem e use-a como guia para programar os componentes em Next.js com Tailwind CSS.

5. Validações Antes de Entregar
Sempre que finalizar uma funcionalidade:

Garanta que o código esteja formatado e sem erros de tipagem (TypeScript / Type hints em Python).

Certifique-se de que nenhum arquivo essencial de configuração foi corrompido.