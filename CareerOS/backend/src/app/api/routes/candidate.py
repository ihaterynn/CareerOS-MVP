from fastapi import APIRouter

from app.schemas.candidate import CandidateSnapshot

router = APIRouter()


@router.get("/", response_model=CandidateSnapshot)
def get_candidate_snapshot() -> CandidateSnapshot:
    return CandidateSnapshot(
        name="Aishah Rahman",
        target_role="Senior Software Engineer",
        readiness=78,
        next_actions=[
            "Complete system design bridge module",
            "Refresh CV impact bullets",
            "Review high-confidence job matches",
        ],
    )
