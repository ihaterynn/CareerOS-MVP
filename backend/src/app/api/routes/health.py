from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def get_health() -> dict[str, str | bool]:
    return {
        "ok": True,
        "service": "careeros-api",
    }
