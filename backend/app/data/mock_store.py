"""
CZZ CRM — In-Memory Mock Data Store
Substitui o banco de dados até a integração real com Supabase.
Dados realistas para desenvolvimento e demonstração.
"""

from datetime import datetime, timezone, timedelta
from typing import Any
import uuid

# ── Usuário mock (auth) ───────────────────────────────────────────────────────
MOCK_USER = {
    "id": "user-001",
    "email": "admin@czztech.com",
    "name": "Admin Czz Tech",
    "role": "admin",
    # senha: admin123 (bcrypt hash)
    "password_hash": "$2b$12$EYZjZ84usLAwOlqbjiORB.HBakRXnPqF..f4ff3Rksu7e0FKEPBT.",
}

# ── Cursos ───────────────────────────────────────────────────────────────────
_courses: list[dict[str, Any]] = [
    {
        "id": "course-001",
        "user_id": "user-001",
        "name": "Marketing Digital Completo",
        "description": "Domine o marketing digital do zero ao avançado. Inclui SEO, Google Ads, Meta Ads e Analytics.",
        "category": "Marketing",
        "price": 997.00,
        "duration_hours": 60,
        "is_active": True,
        "created_at": "2025-01-10T10:00:00Z",
        "updated_at": "2025-01-10T10:00:00Z",
    },
    {
        "id": "course-002",
        "user_id": "user-001",
        "name": "Python para Análise de Dados",
        "description": "Aprenda Python com foco em Data Science: Pandas, NumPy, Matplotlib e Machine Learning básico.",
        "category": "Tecnologia",
        "price": 1297.00,
        "duration_hours": 80,
        "is_active": True,
        "created_at": "2025-01-15T10:00:00Z",
        "updated_at": "2025-01-15T10:00:00Z",
    },
    {
        "id": "course-003",
        "user_id": "user-001",
        "name": "Gestão de Vendas B2B",
        "description": "Técnicas avançadas de vendas consultivas para times comerciais e gestores.",
        "category": "Vendas",
        "price": 797.00,
        "duration_hours": 40,
        "is_active": True,
        "created_at": "2025-02-01T10:00:00Z",
        "updated_at": "2025-02-01T10:00:00Z",
    },
    {
        "id": "course-004",
        "user_id": "user-001",
        "name": "Design UX/UI com Figma",
        "description": "Crie interfaces profissionais do zero. Prototipagem, design systems e handoff para devs.",
        "category": "Design",
        "price": 897.00,
        "duration_hours": 50,
        "is_active": True,
        "created_at": "2025-02-10T10:00:00Z",
        "updated_at": "2025-02-10T10:00:00Z",
    },
    {
        "id": "course-005",
        "user_id": "user-001",
        "name": "Liderança e Gestão de Equipes",
        "description": "Desenvolva habilidades de liderança, comunicação e gestão de alto desempenho.",
        "category": "Gestão",
        "price": 697.00,
        "duration_hours": 35,
        "is_active": False,
        "created_at": "2025-03-01T10:00:00Z",
        "updated_at": "2025-03-01T10:00:00Z",
    },
]

# ── Leads ─────────────────────────────────────────────────────────────────────
_leads: list[dict[str, Any]] = [
    {
        "id": "lead-001",
        "user_id": "user-001",
        "name": "Ana Silva",
        "email": "ana.silva@gmail.com",
        "phone": "(11) 98765-4321",
        "course_id": "course-001",
        "status": "novo",
        "source": "ads",
        "notes": "Clicou no anúncio do Instagram. Muito interessada.",
        "created_at": "2025-08-20T09:00:00Z",
        "updated_at": "2025-08-20T09:00:00Z",
    },
    {
        "id": "lead-002",
        "user_id": "user-001",
        "name": "Pedro Rocha",
        "email": "pedro.rocha@hotmail.com",
        "phone": "(21) 99876-5432",
        "course_id": "course-002",
        "status": "contatado",
        "source": "webinar",
        "notes": "Participou do webinar gratuito. Pediu mais informações sobre parcelamento.",
        "created_at": "2025-08-18T14:00:00Z",
        "updated_at": "2025-08-21T10:00:00Z",
    },
    {
        "id": "lead-003",
        "user_id": "user-001",
        "name": "Marina Costa",
        "email": "marina.costa@empresa.com.br",
        "phone": "(31) 98888-7777",
        "course_id": "course-004",
        "status": "proposta",
        "source": "organic",
        "notes": "Quer comprar para a equipe inteira. Negociando desconto corporativo.",
        "created_at": "2025-08-15T11:00:00Z",
        "updated_at": "2025-08-22T16:00:00Z",
    },
    {
        "id": "lead-004",
        "user_id": "user-001",
        "name": "João Pinto",
        "email": "joao.pinto@gmail.com",
        "phone": "(51) 97654-3210",
        "course_id": "course-001",
        "status": "matriculado",
        "source": "referral",
        "notes": "Indicado por um aluno atual. Pagou à vista com desconto de 10%.",
        "created_at": "2025-08-10T08:00:00Z",
        "updated_at": "2025-08-20T09:30:00Z",
    },
    {
        "id": "lead-005",
        "user_id": "user-001",
        "name": "Carla Mendes",
        "email": "carla.mendes@yahoo.com.br",
        "phone": "(85) 99123-4567",
        "course_id": "course-003",
        "status": "perdido",
        "source": "ads",
        "notes": "Desistiu por falta de tempo. Recontatar em 3 meses.",
        "created_at": "2025-08-05T15:00:00Z",
        "updated_at": "2025-08-18T12:00:00Z",
    },
    {
        "id": "lead-006",
        "user_id": "user-001",
        "name": "Rafael Duarte",
        "email": "rafael.duarte@gmail.com",
        "phone": "(11) 96543-2109",
        "course_id": "course-002",
        "status": "novo",
        "source": "organic",
        "notes": "Encontrou o curso pelo Google.",
        "created_at": "2025-09-01T10:00:00Z",
        "updated_at": "2025-09-01T10:00:00Z",
    },
    {
        "id": "lead-007",
        "user_id": "user-001",
        "name": "Fernanda Lima",
        "email": "fernanda.lima@empresa.com",
        "phone": "(41) 98765-1234",
        "course_id": "course-003",
        "status": "contatado",
        "source": "webinar",
        "notes": "Assistiu ao webinar completo. Agendou ligação para amanhã.",
        "created_at": "2025-08-28T09:00:00Z",
        "updated_at": "2025-09-02T11:00:00Z",
    },
    {
        "id": "lead-008",
        "user_id": "user-001",
        "name": "Lucas Oliveira",
        "email": "lucas.oliveira@dev.com",
        "phone": "(21) 97890-1234",
        "course_id": "course-002",
        "status": "proposta",
        "source": "referral",
        "notes": "Dev sênior que quer transicionar para Data Science. Proposta enviada por email.",
        "created_at": "2025-08-25T14:00:00Z",
        "updated_at": "2025-09-03T09:00:00Z",
    },
    {
        "id": "lead-009",
        "user_id": "user-001",
        "name": "Beatriz Santos",
        "email": "beatriz.santos@gmail.com",
        "phone": "(71) 99876-4321",
        "course_id": "course-004",
        "status": "matriculado",
        "source": "ads",
        "notes": "Comprou no impulso após ver o anúncio. Pagamento via cartão.",
        "created_at": "2025-08-12T16:00:00Z",
        "updated_at": "2025-08-22T10:00:00Z",
    },
    {
        "id": "lead-010",
        "user_id": "user-001",
        "name": "Thiago Ferreira",
        "email": "thiago.ferreira@gmail.com",
        "phone": "(11) 95432-1098",
        "course_id": "course-001",
        "status": "novo",
        "source": "organic",
        "notes": "Deixou email no blog. Primeiro contato ainda não feito.",
        "created_at": "2025-09-05T08:00:00Z",
        "updated_at": "2025-09-05T08:00:00Z",
    },
]

# ── Interações ────────────────────────────────────────────────────────────────
_interactions: list[dict[str, Any]] = [
    {
        "id": "int-001",
        "lead_id": "lead-002",
        "user_id": "user-001",
        "note": "Liguei e expliquei os módulos do curso. Ele quer parcelar em 12x.",
        "type": "call",
        "created_at": "2025-08-21T10:00:00Z",
    },
    {
        "id": "int-002",
        "lead_id": "lead-003",
        "user_id": "user-001",
        "note": "Enviamos proposta de licença corporativa para 10 alunos com 20% de desconto.",
        "type": "email",
        "created_at": "2025-08-22T16:00:00Z",
    },
    {
        "id": "int-003",
        "lead_id": "lead-004",
        "user_id": "user-001",
        "note": "Pagamento confirmado! Acesso liberado no portal. Aluno muito satisfeito.",
        "type": "note",
        "created_at": "2025-08-20T09:30:00Z",
    },
    {
        "id": "int-004",
        "lead_id": "lead-007",
        "user_id": "user-001",
        "note": "Mandei mensagem no WhatsApp. Confirmou interesse, agendou ligação.",
        "type": "whatsapp",
        "created_at": "2025-09-02T11:00:00Z",
    },
]

# ── Refresh Tokens (in-memory, não persiste no restart) ───────────────────────
_refresh_tokens: set[str] = set()


# ── Funções de Acesso (simulam repositório) ───────────────────────────────────

def get_courses(user_id: str) -> list[dict]:
    return [c for c in _courses if c["user_id"] == user_id]


def get_course_by_id(course_id: str, user_id: str) -> dict | None:
    return next((c for c in _courses if c["id"] == course_id and c["user_id"] == user_id), None)


def create_course(data: dict) -> dict:
    data["id"] = f"course-{uuid.uuid4().hex[:8]}"
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    _courses.append(data)
    return data


def update_course(course_id: str, user_id: str, updates: dict) -> dict | None:
    course = get_course_by_id(course_id, user_id)
    if not course:
        return None
    course.update(updates)
    course["updated_at"] = datetime.now(timezone.utc).isoformat()
    return course


def delete_course(course_id: str, user_id: str) -> bool:
    course = get_course_by_id(course_id, user_id)
    if not course:
        return False
    _courses.remove(course)
    return True


def get_leads(user_id: str, status: str | None = None, course_id: str | None = None) -> list[dict]:
    result = [l for l in _leads if l["user_id"] == user_id]
    if status:
        result = [l for l in result if l["status"] == status]
    if course_id:
        result = [l for l in result if l["course_id"] == course_id]
    return result


def get_lead_by_id(lead_id: str, user_id: str) -> dict | None:
    return next((l for l in _leads if l["id"] == lead_id and l["user_id"] == user_id), None)


def create_lead(data: dict) -> dict:
    data["id"] = f"lead-{uuid.uuid4().hex[:8]}"
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    _leads.append(data)
    return data


def update_lead(lead_id: str, user_id: str, updates: dict) -> dict | None:
    lead = get_lead_by_id(lead_id, user_id)
    if not lead:
        return None
    lead.update(updates)
    lead["updated_at"] = datetime.now(timezone.utc).isoformat()
    return lead


def delete_lead(lead_id: str, user_id: str) -> bool:
    lead = get_lead_by_id(lead_id, user_id)
    if not lead:
        return False
    _leads.remove(lead)
    return True


def get_interactions_by_lead(lead_id: str, user_id: str) -> list[dict]:
    return [i for i in _interactions if i["lead_id"] == lead_id and i["user_id"] == user_id]


def create_interaction(data: dict) -> dict:
    data["id"] = f"int-{uuid.uuid4().hex[:8]}"
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    _interactions.append(data)
    return data


def add_refresh_token(token: str) -> None:
    _refresh_tokens.add(token)


def revoke_refresh_token(token: str) -> bool:
    if token in _refresh_tokens:
        _refresh_tokens.discard(token)
        return True
    return False


def is_refresh_token_valid(token: str) -> bool:
    return token in _refresh_tokens
