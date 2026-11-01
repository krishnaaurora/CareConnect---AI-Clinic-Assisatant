import asyncio
import httpx
import json
from app.main import app
from app.core.database import connect_to_mongo, close_mongo_connection, get_database

async def run_tests():
    print("=" * 75)
    print("CARECONNECT AI - EXACT SARVAM EVALUATION VERIFICATION TEST SUITE")
    print("=" * 75)
    
    await connect_to_mongo()
    db = get_database()
    
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        
        # -------------------------------------------------------------
        # TEST 1: Exact Sarvam Payload for get_report_status (POST /api/v1/diagnostic-reports/status)
        # -------------------------------------------------------------
        print("\n[TEST 1] POST /api/v1/diagnostic-reports/status (Exact Sarvam Payload)")
        payload_issue_1 = {
            "date_of_birth": "1994-08-14",
            "patient_phone": "9876543210"
        }
        res1 = await client.post("/api/v1/diagnostic-reports/status", json=payload_issue_1)
        print(f"Status Code: {res1.status_code}")
        print(f"Response: {json.dumps(res1.json(), indent=2)}")
        assert res1.status_code == 200, f"Expected 200, got {res1.status_code}"
        d1 = res1.json()
        assert d1.get("success") is True
        assert d1.get("status") == "Ready"
        assert d1.get("report_status") == "Ready"
        assert d1.get("patient_name") == "Manan"
        assert d1.get("report_type") == "Blood Test"
        assert d1.get("ready_for_pickup") is True
        print("--> PASS (Report status successfully retrieved and DOB verified for Manan)")

        # -------------------------------------------------------------
        # TEST 2: GET with query params for get_report_status
        # -------------------------------------------------------------
        print("\n[TEST 2] GET /api/v1/diagnostic-reports/status?date_of_birth=1994-08-14&patient_phone=9876543210")
        res2 = await client.get("/api/v1/diagnostic-reports/status?date_of_birth=1994-08-14&patient_phone=9876543210")
        print(f"Status Code: {res2.status_code}")
        assert res2.status_code == 200
        assert res2.json().get("success") is True
        print("--> PASS")

        # -------------------------------------------------------------
        # TEST 3: Negative Test - Invalid Identity / DOB Mismatch
        # -------------------------------------------------------------
        print("\n[TEST 3] POST /api/v1/diagnostic-reports/status with WRONG DOB (date_of_birth: 2001-05-20)")
        res3 = await client.post("/api/v1/diagnostic-reports/status", json={
            "date_of_birth": "2001-05-20",
            "patient_phone": "9876543210"
        })
        print(f"Status Code: {res3.status_code}")
        print(f"Response: {json.dumps(res3.json(), indent=2)}")
        assert res3.status_code == 200
        d3 = res3.json()
        assert d3.get("success") is False
        assert d3.get("status") == "IDENTITY_VERIFICATION_FAILED"
        assert d3.get("data", {}).get("error") == "DOB_MISMATCH"
        print("--> PASS (Cleanly distinguished identity verification failure)")

        # -------------------------------------------------------------
        # TEST 4: Negative Test - Missing Patient Records
        # -------------------------------------------------------------
        print("\n[TEST 4] POST /api/v1/diagnostic-reports/status for Unregistered Phone (phone: 9111122222)")
        res4 = await client.post("/api/v1/diagnostic-reports/status", json={
            "date_of_birth": "1994-08-14",
            "patient_phone": "9111122222"
        })
        print(f"Status Code: {res4.status_code}")
        print(f"Response: {json.dumps(res4.json(), indent=2)}")
        assert res4.status_code == 200
        d4 = res4.json()
        assert d4.get("success") is False
        assert d4.get("status") == "PATIENT_NOT_FOUND"
        print("--> PASS (Cleanly distinguished missing patient record)")

        # -------------------------------------------------------------
        # TEST 5: Exact Sarvam Payload for Callback (POST /api/v1/enquiries/callback)
        # -------------------------------------------------------------
        print("\n[TEST 5] POST /api/v1/enquiries/callback (Exact Sarvam Payload)")
        payload_issue_2 = {
            "caller_name": "Manan",
            "caller_phone": "9876543210",
            "preferred_time": "today after 12 PM",
            "reason": "checking blood test report status"
        }
        res5 = await client.post("/api/v1/enquiries/callback", json=payload_issue_2)
        print(f"Status Code: {res5.status_code}")
        print(f"Response: {json.dumps(res5.json(), indent=2)}")
        assert res5.status_code == 200, f"Expected 200, got {res5.status_code}"
        d5 = res5.json()
        assert d5.get("success") is True
        assert d5.get("status") == "QUEUED_FOR_CLINIC_STAFF"
        assert d5.get("callback_id") is not None
        assert d5.get("caller_name") == "Manan"
        assert d5.get("preferred_time") == "today after 12 PM"
        cb_id = d5.get("callback_id")
        print(f"--> PASS (Callback registered successfully with ID: {cb_id})")

        # -------------------------------------------------------------
        # TEST 6: Exact Sarvam Payload for Callback on Root Alias (/callback)
        # -------------------------------------------------------------
        print("\n[TEST 6] POST /callback (Root Alias with Exact Sarvam Payload)")
        res6 = await client.post("/callback", json=payload_issue_2)
        print(f"Status Code: {res6.status_code}")
        assert res6.status_code == 200
        assert res6.json().get("success") is True
        print("--> PASS")

        # -------------------------------------------------------------
        # TEST 7: Verify Database Record in MongoDB
        # -------------------------------------------------------------
        print("\n[TEST 7] Verifying saved record in MongoDB 'enquiries' collection...")
        rec = await db["enquiries"].find_one({"callback_id": cb_id}, {"_id": 0})
        print(f"MongoDB Document: {json.dumps(rec, indent=2)}")
        assert rec is not None
        assert rec.get("name") == "Manan"
        assert rec.get("preferred_time") == "today after 12 PM"
        assert rec.get("status") == "QUEUED_FOR_CLINIC_STAFF"
        print("--> PASS (MongoDB record verified)")

    await close_mongo_connection()
    print("\n" + "=" * 75)
    print("ALL TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 75)

if __name__ == "__main__":
    asyncio.run(run_tests())
