from pydantic import BaseModel, Field


class RunRequest(BaseModel):
    lang: str = Field(..., description="Language runtime identifier")
    cmd: str = Field(..., description="Command to execute inside runtime container")
    proj_id: str = Field(..., description="Identifier of the workspace/project")


class RunResponse(BaseModel):
    exit_code: int
    output: str


class ChatRequest(BaseModel):
    prompt: str


class ChatResponse(BaseModel):
    response: str | None = None
    output: str | None = None
