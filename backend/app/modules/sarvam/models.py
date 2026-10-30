from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class SarvamAgentVariables(BaseModel):
    patient_name: str
    call_purpose: str = "REPORT_READY"
    test_name: str
    preferred_language: Optional[str] = None
    collection_context: Optional[str] = None

class SarvamConnectionConfig(BaseModel):
    connection_id: str
    agent_phone_number: str

class SarvamAppConfig(BaseModel):
    app_id: str
    app_version: int = 4
    app_type: str = "agent"
    connection_config: SarvamConnectionConfig
    agent_variables: Dict[str, Any]

class SarvamUserConfig(BaseModel):
    user_phone_number: str

class SarvamWebhookMetadata(BaseModel):
    report_id: str
    patient_id: str

class SarvamWebhookConfig(BaseModel):
    url: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class SarvamInstantOutboundPayload(BaseModel):
    app_config: SarvamAppConfig
    user_config: SarvamUserConfig
    webhook_config: Optional[SarvamWebhookConfig] = None

class SarvamWebhookPayload(BaseModel):
    attempt_id: Optional[str] = None
    interaction_id: Optional[str] = None
    status: Optional[str] = "completed"
    duration: Optional[float] = 0.0
    failure_reason: Optional[str] = None
    final_agent_variables: Optional[Dict[str, Any]] = Field(default_factory=dict)
    interaction_transcript: Optional[str] = None
    webhook_config: Optional[Dict[str, Any]] = None

class ReportNotifyRequest(BaseModel):
    channel: Optional[str] = "Sarvam Voice AI Call"
    preferred_language: Optional[str] = "English"
    custom_notes: Optional[str] = None
