from fastapi import APIRouter

from app.schemas.employer import EmployerSnapshot

router = APIRouter()


@router.get("/", response_model=EmployerSnapshot)
def get_employer_snapshot() -> EmployerSnapshot:
    return EmployerSnapshot(
        organization="Cempaka Digital",
        open_roles=18,
        talent_matches=247,
        risk_alerts=9,
    )
