from fastapi import APIRouter

from app.api.routes.candidate import router as candidate_router
from app.api.routes.employer import router as employer_router
from app.api.routes.health import router as health_router

api_router = APIRouter()
api_router.include_router(health_router, prefix="/health", tags=["health"])
api_router.include_router(candidate_router, prefix="/candidate", tags=["candidate"])
api_router.include_router(employer_router, prefix="/employer", tags=["employer"])
