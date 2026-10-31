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

    @staticmethod
    def sanitize_api_key(raw_key: str) -> str:
        """
        Normalizes Sarvam API key format:
        - Strips surrounding whitespace and quotes.
        - Preserves the sk_samvaad_ workspace prefix required by the Sarvam Voice Agent Runtime API.
        - Ensures sk_samvaad_ is present if provided as sk_ for conversational runtime.
        """
        key = str(raw_key or "").strip().strip("'\" \r\n\t")
        if not key.startswith("sk_samvaad_") and key.startswith("sk_"):
            key = "sk_samvaad_" + key[3:]
        return key

    def __init__(self):
        self.api_key = self.sanitize_api_key(settings.SARVAM_API_KEY)
        self.org_id = str(settings.SARVAM_ORG_ID or "").strip()
        self.workspace_id = str(settings.SARVAM_WORKSPACE_ID or "").strip()
        self.base_url = str(settings.SARVAM_API_BASE_URL or "").strip().rstrip("/")
        self.agent_id = str(settings.SARVAM_AGENT_ID or "").strip()
        self.agent_version = int(settings.SARVAM_AGENT_VERSION)
        self.connection_id = str(settings.SARVAM_CONNECTION_ID or "").strip()
        self.agent_phone = str(settings.SARVAM_AGENT_PHONE_NUMBER or "").strip()
        self.webhook_url = str(settings.SARVAM_WEBHOOK_URL or "").strip()

    @property
    def outbound_url(self) -> str:
        return f"{self.base_url}/outbounds/v1/orgs/{self.org_id}/workspaces/{self.workspace_id}/outbounds"

    @property
    def runtime_url_endpoint(self) -> str:
        return f"https://apps.sarvam.ai/api/app-runtime/orgs/{self.org_id}/workspaces/{self.workspace_id}/apps/{self.agent_id}/url"

    async def request_browser_session_url(
        self,
        interaction_type: str = "call",
        version: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Requests a fresh signed WebSocket URL from Sarvam Voice Agent Runtime API.
        Endpoint: GET https://apps.sarvam.ai/api/app-runtime/orgs/{org_id}/workspaces/{workspace_id}/apps/{app_id}/url
        Authentication: X-API-Key header (preserving full sk_samvaad_ key prefix).
        Never logs or exposes the API key or raw signed session tokens.
        """
        target_version = version or self.agent_version
        params = {
            "interaction_type": interaction_type,
            "version": str(target_version)
        }
        active_key = self.sanitize_api_key(self.api_key or settings.SARVAM_API_KEY)
        headers = {
            "X-API-Key": active_key
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(self.runtime_url_endpoint, params=params, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "success": True,
                    "signed_url": data.get("url"),
                    "reference_id": data.get("reference_id"),
                    "expires_at": data.get("expires_at"),
                    "config": {
                        "org_id": self.org_id,
                        "workspace_id": self.workspace_id,
                        "app_id": self.agent_id,
                        "version": target_version,
                        "interaction_type": interaction_type
                    }
                }
            else:
                logger.error(f"Sarvam runtime session creation failed with status {resp.status_code}: {resp.text}")
                return {
                    "success": False,
                    "status_code": resp.status_code,
                    "error": f"Sarvam runtime returned status {resp.status_code}"
                }

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
        wh_url = webhook_override_url or self.webhook_url or f"{settings.BACKEND_URL.rstrip('/')}/api/voice/sarvam/webhook"

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

        active_key = self.sanitize_api_key(self.api_key or settings.SARVAM_API_KEY)
        headers = {
            "Content-Type": "application/json",
            "X-API-Key": active_key,
            "api-subscription-key": active_key
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

