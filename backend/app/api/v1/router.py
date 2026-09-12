"""
CZZ CRM — API Routes v1
"""

from fastapi import APIRouter, Depends, Query, status
from slowapi import Limiter
from slowapi.util import get_remote_address

from ...core.security import get_current_user
from ...core.exceptions import BadRequestError
from ...schemas.schemas import (
    LoginRequest, RefreshRequest, TokenResponse, UserOut,
    CourseCreate, CourseUpdate, CourseOut,
    LeadCreate, LeadUpdate, LeadMoveRequest, LeadOut,
    InteractionCreate, InteractionOut, DashboardMetrics,
)
from ...services.services import AuthService, CourseService, LeadService, DashboardService
from ...core.config import get_settings

settings = get_settings()
limiter = Limiter(key_func=get_remote_address)

router = APIRouter()
auth_service = AuthService()
course_service = CourseService()
lead_service = LeadService()
dashboard_service = DashboardService()


# ══ AUTH ══════════════════════════════════════════════════════════════════════

@router.post(
    "/auth/login",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Autenticar usuário",
    tags=["Auth"],
)
async def login(body: LoginRequest):
    result = auth_service.login(body)
    user = result["user"]
    token: TokenResponse = result["token"]
    return {
        "access_token": token.access_token,
        "refresh_token": token.refresh_token,
        "token_type": token.token_type,
        "expires_in": token.expires_in,
        "user": UserOut(
            id=user["id"], email=user["email"],
            name=user["name"], role=user["role"]
        ),
    }


@router.post(
    "/auth/refresh",
    response_model=TokenResponse,
    summary="Renovar access token",
    tags=["Auth"],
)
async def refresh_token(body: RefreshRequest):
    return auth_service.refresh(body.refresh_token)


@router.post(
    "/auth/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Revogar refresh token",
    tags=["Auth"],
)
async def logout(body: RefreshRequest):
    auth_service.logout(body.refresh_token)


@router.get(
    "/auth/me",
    response_model=UserOut,
    summary="Dados do usuário atual",
    tags=["Auth"],
)
async def me(current_user: dict = Depends(get_current_user)):
    user = auth_service.login.__self__  # Workaround mock
    u = __import__("app.data.mock_store", fromlist=["MOCK_USER"]).MOCK_USER
    return UserOut(id=u["id"], email=u["email"], name=u["name"], role=u["role"])


# ══ DASHBOARD ══════════════════════════════════════════════════════════════════

@router.get(
    "/dashboard",
    response_model=DashboardMetrics,
    summary="Métricas do dashboard",
    tags=["Dashboard"],
)
async def get_dashboard(current_user: dict = Depends(get_current_user)):
    return dashboard_service.get_metrics(current_user["sub"])


# ══ COURSES ════════════════════════════════════════════════════════════════════

@router.get(
    "/courses",
    response_model=list[CourseOut],
    summary="Listar cursos",
    tags=["Courses"],
)
async def list_courses(current_user: dict = Depends(get_current_user)):
    return course_service.list_courses(current_user["sub"])


@router.post(
    "/courses",
    response_model=CourseOut,
    status_code=status.HTTP_201_CREATED,
    summary="Criar curso",
    tags=["Courses"],
)
async def create_course(body: CourseCreate, current_user: dict = Depends(get_current_user)):
    return course_service.create_course(body, current_user["sub"])


@router.get(
    "/courses/{course_id}",
    response_model=CourseOut,
    summary="Buscar curso por ID",
    tags=["Courses"],
)
async def get_course(course_id: str, current_user: dict = Depends(get_current_user)):
    return course_service.get_course(course_id, current_user["sub"])


@router.patch(
    "/courses/{course_id}",
    response_model=CourseOut,
    summary="Atualizar curso",
    tags=["Courses"],
)
async def update_course(course_id: str, body: CourseUpdate, current_user: dict = Depends(get_current_user)):
    return course_service.update_course(course_id, body, current_user["sub"])


@router.delete(
    "/courses/{course_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Excluir curso",
    tags=["Courses"],
)
async def delete_course(course_id: str, current_user: dict = Depends(get_current_user)):
    course_service.delete_course(course_id, current_user["sub"])


# ══ LEADS ══════════════════════════════════════════════════════════════════════

@router.get(
    "/leads",
    response_model=list[LeadOut],
    summary="Listar leads",
    tags=["Leads"],
)
async def list_leads(
    status: str | None = Query(default=None),
    course_id: str | None = Query(default=None),
    current_user: dict = Depends(get_current_user),
):
    return lead_service.list_leads(current_user["sub"], status, course_id)


@router.post(
    "/leads",
    response_model=LeadOut,
    status_code=status.HTTP_201_CREATED,
    summary="Criar lead",
    tags=["Leads"],
)
async def create_lead(body: LeadCreate, current_user: dict = Depends(get_current_user)):
    return lead_service.create_lead(body, current_user["sub"])


@router.get(
    "/leads/{lead_id}",
    response_model=LeadOut,
    summary="Buscar lead por ID",
    tags=["Leads"],
)
async def get_lead(lead_id: str, current_user: dict = Depends(get_current_user)):
    return lead_service.get_lead(lead_id, current_user["sub"])


@router.patch(
    "/leads/{lead_id}",
    response_model=LeadOut,
    summary="Atualizar lead",
    tags=["Leads"],
)
async def update_lead(lead_id: str, body: LeadUpdate, current_user: dict = Depends(get_current_user)):
    return lead_service.update_lead(lead_id, body, current_user["sub"])


@router.patch(
    "/leads/{lead_id}/move",
    response_model=LeadOut,
    summary="Mover lead no funil (máquina de estados)",
    tags=["Leads"],
)
async def move_lead(lead_id: str, body: LeadMoveRequest, current_user: dict = Depends(get_current_user)):
    return lead_service.move_lead(lead_id, body.status, current_user["sub"])


@router.delete(
    "/leads/{lead_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Excluir lead",
    tags=["Leads"],
)
async def delete_lead(lead_id: str, current_user: dict = Depends(get_current_user)):
    lead_service.delete_lead(lead_id, current_user["sub"])


# ══ INTERACTIONS ═══════════════════════════════════════════════════════════════

@router.get(
    "/leads/{lead_id}/interactions",
    response_model=list[InteractionOut],
    summary="Histórico de interações do lead",
    tags=["Interactions"],
)
async def get_interactions(lead_id: str, current_user: dict = Depends(get_current_user)):
    return lead_service.get_interactions(lead_id, current_user["sub"])


@router.post(
    "/leads/{lead_id}/interactions",
    response_model=InteractionOut,
    status_code=status.HTTP_201_CREATED,
    summary="Adicionar interação ao lead",
    tags=["Interactions"],
)
async def add_interaction(
    lead_id: str,
    body: InteractionCreate,
    current_user: dict = Depends(get_current_user),
):
    return lead_service.add_interaction(lead_id, body, current_user["sub"])
