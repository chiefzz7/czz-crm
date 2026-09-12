"""
CZZ CRM — Services Layer
Lógica de negócio pura. Sem dependência de HTTP.
"""

from datetime import datetime, timezone
from collections import defaultdict

from ..data import mock_store as store
from ..core.security import verify_password, create_access_token, create_refresh_token, verify_refresh_token
from ..core.exceptions import (
    InvalidCredentialsError, NotFoundError, ConflictError, InvalidTokenError
)
from ..schemas.schemas import (
    LoginRequest, TokenResponse, CourseCreate, CourseUpdate,
    LeadCreate, LeadUpdate, InteractionCreate, DashboardMetrics,
    PipelineStageStats, MonthlyRevenue
)
from ..core.config import get_settings


# ── Auth Service ──────────────────────────────────────────────────────────────

class AuthService:

    def login(self, data: LoginRequest) -> dict:
        user = store.MOCK_USER
        if data.email != user["email"]:
            raise InvalidCredentialsError()
        if not verify_password(data.password, user["password_hash"]):
            raise InvalidCredentialsError()

        access = create_access_token(user["id"], user["email"])
        refresh = create_refresh_token(user["id"])
        store.add_refresh_token(refresh)

        settings = get_settings()
        return {
            "token": TokenResponse(
                access_token=access,
                refresh_token=refresh,
                expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            ),
            "user": user,
        }

    def refresh(self, refresh_token: str) -> TokenResponse:
        if not store.is_refresh_token_valid(refresh_token):
            raise InvalidTokenError()

        payload = verify_refresh_token(refresh_token)
        user_id = payload.get("sub")
        user = store.MOCK_USER

        # Rotate: revoke old, issue new
        store.revoke_refresh_token(refresh_token)
        new_access = create_access_token(user_id, user["email"])
        new_refresh = create_refresh_token(user_id)
        store.add_refresh_token(new_refresh)

        settings = get_settings()
        return TokenResponse(
            access_token=new_access,
            refresh_token=new_refresh,
            expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    def logout(self, refresh_token: str) -> None:
        store.revoke_refresh_token(refresh_token)


# ── Course Service ────────────────────────────────────────────────────────────

class CourseService:

    def list_courses(self, user_id: str) -> list[dict]:
        return store.get_courses(user_id)

    def get_course(self, course_id: str, user_id: str) -> dict:
        course = store.get_course_by_id(course_id, user_id)
        if not course:
            raise NotFoundError("Curso")
        return course

    def create_course(self, data: CourseCreate, user_id: str) -> dict:
        # Verifica duplicata por nome
        existing = [c for c in store.get_courses(user_id) if c["name"].lower() == data.name.lower()]
        if existing:
            raise ConflictError("Já existe um curso com esse nome.")
        payload = data.model_dump()
        payload["user_id"] = user_id
        return store.create_course(payload)

    def update_course(self, course_id: str, data: CourseUpdate, user_id: str) -> dict:
        self.get_course(course_id, user_id)  # 404 check
        updates = {k: v for k, v in data.model_dump().items() if v is not None}
        return store.update_course(course_id, user_id, updates)

    def delete_course(self, course_id: str, user_id: str) -> None:
        self.get_course(course_id, user_id)  # 404 check
        store.delete_course(course_id, user_id)


# ── Lead Service ──────────────────────────────────────────────────────────────

VALID_TRANSITIONS: dict[str, list[str]] = {
    "novo":       ["contatado", "perdido"],
    "contatado":  ["proposta", "perdido"],
    "proposta":   ["matriculado", "perdido"],
    "matriculado": [],
    "perdido":    ["novo"],  # Reativação
}

class LeadService:

    def list_leads(self, user_id: str, status: str | None, course_id: str | None) -> list[dict]:
        return store.get_leads(user_id, status, course_id)

    def get_lead(self, lead_id: str, user_id: str) -> dict:
        lead = store.get_lead_by_id(lead_id, user_id)
        if not lead:
            raise NotFoundError("Lead")
        return lead

    def create_lead(self, data: LeadCreate, user_id: str) -> dict:
        # Verifica email duplicado
        existing = [l for l in store.get_leads(user_id) if l["email"].lower() == data.email.lower()]
        if existing:
            raise ConflictError("Já existe um lead com esse e-mail.")
        payload = data.model_dump()
        payload["user_id"] = user_id
        payload["status"] = "novo"
        return store.create_lead(payload)

    def update_lead(self, lead_id: str, data: LeadUpdate, user_id: str) -> dict:
        self.get_lead(lead_id, user_id)  # 404 check
        updates = {k: v for k, v in data.model_dump().items() if v is not None}
        return store.update_lead(lead_id, user_id, updates)

    def move_lead(self, lead_id: str, new_status: str, user_id: str) -> dict:
        lead = self.get_lead(lead_id, user_id)
        current = lead["status"]
        allowed = VALID_TRANSITIONS.get(current, [])
        if new_status not in allowed:
            raise ConflictError(
                f"Transição inválida: '{current}' → '{new_status}'. "
                f"Permitido: {allowed or 'nenhuma'}"
            )
        return store.update_lead(lead_id, user_id, {"status": new_status})

    def delete_lead(self, lead_id: str, user_id: str) -> None:
        self.get_lead(lead_id, user_id)  # 404 check
        store.delete_lead(lead_id, user_id)

    def add_interaction(self, lead_id: str, data: InteractionCreate, user_id: str) -> dict:
        self.get_lead(lead_id, user_id)  # 404 check
        payload = data.model_dump()
        payload["lead_id"] = lead_id
        payload["user_id"] = user_id
        return store.create_interaction(payload)

    def get_interactions(self, lead_id: str, user_id: str) -> list[dict]:
        self.get_lead(lead_id, user_id)  # 404 check
        return store.get_interactions_by_lead(lead_id, user_id)


# ── Dashboard Service ─────────────────────────────────────────────────────────

class DashboardService:

    def get_metrics(self, user_id: str) -> DashboardMetrics:
        leads = store.get_leads(user_id)
        courses = store.get_courses(user_id)

        now = datetime.now(timezone.utc)
        this_month_leads = [
            l for l in leads
            if datetime.fromisoformat(l["created_at"].replace("Z", "+00:00")).month == now.month
            and datetime.fromisoformat(l["created_at"].replace("Z", "+00:00")).year == now.year
        ]

        # Calcula receita dos matriculados
        course_prices = {c["id"]: c["price"] for c in courses}
        enrolled = [l for l in leads if l["status"] == "matriculado"]
        total_revenue = sum(course_prices.get(l.get("course_id", ""), 0) for l in enrolled)

        enrolled_this_month = [
            l for l in enrolled
            if datetime.fromisoformat(l["updated_at"].replace("Z", "+00:00")).month == now.month
        ]
        revenue_this_month = sum(course_prices.get(l.get("course_id", ""), 0) for l in enrolled_this_month)

        # Taxa de conversão
        total = len(leads)
        conversion_rate = round((len(enrolled) / total * 100) if total else 0, 1)

        # Pipeline por estágio
        stage_counts: dict[str, int] = defaultdict(int)
        stage_values: dict[str, float] = defaultdict(float)
        for lead in leads:
            s = lead["status"]
            stage_counts[s] += 1
            stage_values[s] += course_prices.get(lead.get("course_id", ""), 0)

        pipeline_stages = [
            PipelineStageStats(status=s, count=stage_counts[s], total_value=stage_values[s])
            for s in ["novo", "contatado", "proposta", "matriculado", "perdido"]
        ]

        # Receita mensal (últimos 6 meses simulados)
        monthly = []
        months = ["Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set"]
        values = [8200, 12400, 15800, 22100, 31500, 39800, total_revenue]
        for m, v in zip(months, values):
            monthly.append(MonthlyRevenue(month=m, revenue=round(v, 2)))

        return DashboardMetrics(
            total_leads=total,
            leads_this_month=len(this_month_leads),
            conversion_rate=conversion_rate,
            total_revenue=round(total_revenue, 2),
            revenue_this_month=round(revenue_this_month, 2),
            active_deals=stage_counts["proposta"] + stage_counts["contatado"],
            pipeline_stages=pipeline_stages,
            monthly_revenue=monthly,
        )
