from pydantic import BaseModel, Field


class CandidateSnapshot(BaseModel):
    name: str
    target_role: str = Field(serialization_alias="targetRole")
    readiness: int
    next_actions: list[str] = Field(serialization_alias="nextActions")
