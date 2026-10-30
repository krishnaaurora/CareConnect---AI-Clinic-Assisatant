import logging
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("careconnect.sarvam")

class SarvamVoiceClient:
    """
    Client for the Sarvam Instant Outbound API (Voice Agents).
    Endpoint: POST https://apps.sarvam.ai/api/outbounds/v1/orgs/{org_id}/workspaces/{workspace_id}/outbounds
    Authentication: X-API-Key header
    """

    def __init__(self):
        self.api_key = settings.SARVAM_API_KEY
        self.org_id = settings.SARVAM_ORG_ID
        self.workspace_id = settings.SARVAM_WORKSPACE_ID
        self.base_url = settings.SARVAM_API_BASE_URL.rstrip("/")
        self.agent_id = settings.SARVAM_AGENT_ID
        self.agent_version = settings.SARVAM_AGENT_VERSION
        self.connection_id = settings.SARVAM_CONNECTION_ID
        self.agent_phone = settings.SARVAM_AGENT_PHONE_NUMBER
        self.webhook_url = settings.SARVAM_WEBHOOK_URL

    @property
    def outbound_url(self) -> str:
        return f"{self.base_url}/outbounds/v1/orgs/{self.org_id}/workspaces/{self.workspace_id}/outbounds"

    @staticmethod
    def format_phone_number(raw_phone: str) -> str:
        """
        Normalizes patient phone number to strict E.164 format for India (+91XXXXXXXXXX).
        Blocks invalid numbers with less than 10 digits without substituting any default.
        """
        if not raw_phone or not str(raw_phone).strip():
            raise ValueError("Phone number is empty or missing")
        digits = "".join(filter(str.isdigit, str(raw_phone)))
        if len(digits) == 10:
            return f"+91{digits}"
        elif digits.startswith("91") and len(digits) == 12:
            return f"+{digits}"
        elif len(digits) > 10:
            return f"+91{digits[-10:]}"
        raise ValueError(f"Phone number '{raw_phone}' has only {len(digits)} digits; expected a valid 10-digit Indian mobile number")

    def build_payload(
        self,
        recipient_phone: str,
        patient_name: str,
        test_name: str,
        report_id: str,
        patient_id: str,
        webhook_override_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Builds the validated Sarvam Instant Outbound API request payload.
        Only configured input variables are sent. Output variables are never sent.
        """
        formatted_phone = self.format_phone_number(recipient_phone)
        wh_url = webhook_override_url or self.webhook_url or "https://careconnect-ai.onrender.com/api/voice/sarvam/webhook"

        payload = {
            "app_config": {
                "app_id": self.agent_id,
                "app_version": self.agent_version,
                "app_type": "agent",
                "connection_config": {
                    "connection_id": self.connection_id,
                    "agent_phone_number": self.agent_phone
                },
                "agent_variables": {
                    "patient_name": patient_name,
                    "call_purpose": "REPORT_READY",
                    "test_name": test_name
                }
            },
            "user_config": {
                "user_phone_number": formatted_phone
            },
            "webhook_config": {
                "url": wh_url,
                "metadata": {
                    "report_id": report_id,
                    "patient_id": patient_id
                }
            }
        }
        return payload

    async def create_outbound_call(
        self,
        recipient_phone: str,
        patient_name: str,
        test_name: str,
        report_id: str,
        patient_id: str,
        webhook_override_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Dispatches an Instant Outbound call through Sarvam Voice Agent API.
        Does not reveal medical diagnosis or sensitive test findings.
        """
        payload = self.build_payload(
            recipient_phone=recipient_phone,
            patient_name=patient_name,
            test_name=test_name,
            report_id=report_id,
            patient_id=patient_id,
            webhook_override_url=webhook_override_url
        )

        headers = {
            "Content-Type": "application/json",
            "X-API-Key": self.api_key or settings.SARVAM_API_KEY
        }

        # Safe masked phone for logging
        masked = payload["user_config"]["user_phone_number"]
        if len(masked) > 6:
            masked = masked[:5] + "XXXX" + masked[-2:]

        logger.info(
            f"Initiating Sarvam Instant Outbound call to {masked} for report {report_id} "
            f"(Agent: {self.agent_id} v{self.agent_version})"
        )

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                self.outbound_url,
                json=payload,
                headers=headers
            )

            if resp.status_code in [200, 201, 202]:
                data = resp.json()
                logger.info(f"Sarvam outbound call successfully queued: {data.get('attempt_id') or data.get('id')}")
                return {
                    "success": True,
                    "status_code": resp.status_code,
                    "data": data
                }
            else:
                error_msg = f"Sarvam API responded with status {resp.status_code}: {resp.text}"
                logger.error(error_msg)
                return {
                    "success": False,
                    "status_code": resp.status_code,
                    "error": error_msg,
                    "raw_response": resp.text
                }

