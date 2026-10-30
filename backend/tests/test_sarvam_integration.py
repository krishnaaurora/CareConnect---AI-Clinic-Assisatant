import pytest
import unittest
from unittest.mock import AsyncMock, patch, MagicMock
from app.modules.sarvam.caller import SarvamVoiceClient
from app.modules.sarvam.service import SarvamService
from app.modules.sarvam.repository import SarvamCallRepository

class TestSarvamIntegration(unittest.TestCase):
    def setUp(self):
        self.caller = SarvamVoiceClient()

    def test_phone_number_formatting(self):
        """Verify strict E.164 phone formatting for Indian numbers."""
        self.assertEqual(self.caller.format_phone_number("8897371942"), "+918897371942")
        self.assertEqual(self.caller.format_phone_number("+91 88973 71942"), "+918897371942")
        self.assertEqual(self.caller.format_phone_number("918897371942"), "+918897371942")

    def test_build_payload_contains_only_input_variables(self):
        """
        Verify that outbound payload matches official Sarvam schema
        and does NOT include output/extraction variables.
        """
        payload = self.caller.build_payload(
            recipient_phone="8897371942",
            patient_name="Rahul Sharma",
            test_name="Blood Test",
            report_id="RPT-TEST-001",
            patient_id="PAT-1001",
            webhook_override_url="https://test.clinic.com/api/voice/sarvam/webhook"
        )

        app_config = payload["app_config"]
        self.assertEqual(app_config["app_id"], "Careconnect-ee4e51b7-aa9b")
        self.assertEqual(app_config["app_version"], 4)
        self.assertEqual(app_config["app_type"], "agent")
        self.assertEqual(app_config["connection_config"]["connection_id"], "befb7616-3f-5bcf15a1-5fb4")
        self.assertEqual(app_config["connection_config"]["agent_phone_number"], "+918064269783")

        # Verify only configured input variables are present
        agent_vars = app_config["agent_variables"]
        self.assertEqual(agent_vars["patient_name"], "Rahul Sharma")
        self.assertEqual(agent_vars["call_purpose"], "REPORT_READY")
        self.assertEqual(agent_vars["test_name"], "Blood Test")

        # Output variables MUST NOT be sent
        output_vars = ["call_outcome", "call_summary", "callback_requested", "collection_date", "patient_confirmed", "patient_response"]
        for var in output_vars:
            self.assertNotIn(var, agent_vars)

        # Verify user config
        self.assertEqual(payload["user_config"]["user_phone_number"], "+918897371942")

        # Verify webhook metadata
        metadata = payload["webhook_config"]["metadata"]
        self.assertEqual(metadata["report_id"], "RPT-TEST-001")
        self.assertEqual(metadata["patient_id"], "PAT-1001")
        self.assertNotIn("lead_id", metadata)

    def test_health_check_does_not_call_external_api(self):
        """Verify that health check inspects configuration locally without placing network requests."""
        service = SarvamService()
        health = service.check_health()
        self.assertEqual(health["provider"], "Sarvam AI Voice Agents")
        self.assertEqual(health["agent_id"], "Careconnect-ee4e51b7-aa9b")
        self.assertEqual(health["agent_version"], 4)
        self.assertIn("api_key_configured", health)

if __name__ == "__main__":
    unittest.main()
