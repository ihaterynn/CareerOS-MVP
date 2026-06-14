from pydantic import BaseModel, Field


class EmployerSnapshot(BaseModel):
    organization: str
    open_roles: int = Field(serialization_alias="openRoles")
    talent_matches: int = Field(serialization_alias="talentMatches")
    risk_alerts: int = Field(serialization_alias="riskAlerts")
