"""
CZZ CRM — Pydantic Schemas
Request / Response models com validação estrita.
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # segundos


class RefreshRequest(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    role: str


# ── Course ────────────────────────────────────────────────────────────────────

COURSE_CATEGORIES = ["Marketing", "Tecnologia", "Vendas", "Design", "Gestão", "Finanças", "Saúde", "Outros"]

class CourseCreate(BaseModel):
    name: str = Field(min_length=3, max_length=120)
    description: Optional[str] = Field(default=None, max_length=500)
    category: str
    price: float = Field(gt=0)
    duration_hours: int = Field(gt=0, le=1000)
    is_active: bool = True

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        if v not in COURSE_CATEGORIES:
            raise ValueError(f"Categoria inválida. Use: {COURSE_CATEGORIES}")
        return v

    @field_validator("price")
    @classmethod
    def validate_price(cls, v: float) -> float:
        return round(v, 2)


class CourseUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=3, max_length=120)
    description: Optional[str] = Field(default=None, max_length=500)
    category: Optional[str] = None
    price: Optional[float] = Field(default=None, gt=0)
    duration_hours: Optional[int] = Field(default=None, gt=0)
    is_active: Optional[bool] = None


class CourseOut(BaseModel):
    id: str
    name: str
    description: Optional[str]
    category: str
    price: float
    duration_hours: int
    is_active: bool
    created_at: str
    updated_at: str


# ── Lead ──────────────────────────────────────────────────────────────────────

LEAD_STATUSES = ["novo", "contatado", "proposta", "matriculado", "perdido"]
LEAD_SOURCES = ["ads", "organic", "referral", "webinar", "indicacao", "outro"]

class LeadCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: Optional[EmailStr] = None  # opcional no cadastro
    phone: Optional[str] = Field(default=None, max_length=20)
    course_id: Optional[str] = None
    source: Optional[str] = None
    notes: Optional[str] = Field(default=None, max_length=1000)

    @field_validator("source")
    @classmethod
    def validate_source(cls, v: str | None) -> str | None:
        if v and v not in LEAD_SOURCES:
            raise ValueError(f"Source inválido. Use: {LEAD_SOURCES}")
        return v


class LeadUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, max_length=20)
    course_id: Optional[str] = None
    status: Optional[str] = None
    source: Optional[str] = None
    notes: Optional[str] = Field(default=None, max_length=1000)

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str | None) -> str | None:
        if v and v not in LEAD_STATUSES:
            raise ValueError(f"Status inválido. Use: {LEAD_STATUSES}")
        return v


class LeadMoveRequest(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in LEAD_STATUSES:
            raise ValueError(f"Status inválido. Use: {LEAD_STATUSES}")
        return v


class LeadOut(BaseModel):
    id: str
    name: str
    email: Optional[str]  # pode ser null
    phone: Optional[str]
    course_id: Optional[str]
    status: str
    source: Optional[str]
    notes: Optional[str]
    created_at: str
    updated_at: str


# ── Interaction ───────────────────────────────────────────────────────────────

INTERACTION_TYPES = ["note", "call", "email", "whatsapp"]

class InteractionCreate(BaseModel):
    note: str = Field(min_length=3, max_length=2000)
    type: str = "note"

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in INTERACTION_TYPES:
            raise ValueError(f"Tipo inválido. Use: {INTERACTION_TYPES}")
        return v


class InteractionOut(BaseModel):
    id: str
    lead_id: str
    note: str
    type: str
    created_at: str


# ── Dashboard ─────────────────────────────────────────────────────────────────

class PipelineStageStats(BaseModel):
    status: str
    count: int
    total_value: float


class MonthlyRevenue(BaseModel):
    month: str
    revenue: float


class DashboardMetrics(BaseModel):
    total_leads: int
    leads_this_month: int
    conversion_rate: float
    total_revenue: float
    revenue_this_month: float
    active_deals: int
    pipeline_stages: list[PipelineStageStats]
    monthly_revenue: list[MonthlyRevenue]


# ── Pagination ────────────────────────────────────────────────────────────────

class PaginatedResponse(BaseModel):
    data: list
    total: int
    page: int
    per_page: int
    total_pages: int
