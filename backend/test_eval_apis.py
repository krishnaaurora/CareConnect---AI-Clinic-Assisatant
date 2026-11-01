import asyncio
import httpx
import json
from app.main import app
from app.core.database import connect_to_mongo, close_mongo_connection, get_database

async def run_tests():
    print("=" * 70)
    print("CARECONNECT AI - SARVAM EVALUATION TEST SUITE")
    print("=" * 70)
    
    await connect_to_mongo()
    db = get_database()
    
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        
        # -------------------------------------------------------------
        # TEST 1: Report Status API - GET by phone only
        # -------------------------------------------------------------
        print("\n[TEST 1] GET /api/v1/diagnostic-reports/status?phone=9820154321")
        res = await client.get("/api/v1/diagnostic-reports/status?phone=9820154321")
        print(f"Status: {res.status_code}")
        print(f"Response: {json.dumps(res.json(), indent=2)}")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        assert res.json().get("success") is True
        assert res.json().get("status") in ["Ready", "Processing"]
        assert "Rahul" in res.json().get("patient_name", "")
        print("--> PASS")

        # -------------------------------------------------------------
        # TEST 2: Report Status API - GET with Phone + DOB (YYYY-MM-DD)
        # -------------------------------------------------------------
        print("\n[TEST 2] GET /api/v1/diagnostic-reports/status?phone=9820154321&dob=1988-05-14")
        res = await client.get("/api/v1/diagnostic-reports/status?phone=9820154321&dob=1988-05-14")
        print(f"Status: {res.status_code}")
        print(f"Response: {json.dumps(res.json(), indent=2)}")
        assert res.status_code == 200
        assert res.json().get("success") is True
        print("--> PASS")

        # -------------------------------------------------------------
        # TEST 3: Report Status API - POST with Phone + DOB (DD-MM-YYYY)
        # -------------------------------------------------------------
        print("\n[TEST 3] POST /api/reports/status (Alias) with JSON body {phone_number, dob: 14-05-1988}")
        res = await client.post("/api/reports/status", json={
            "phone_number": "+91 98201 54321",
            "dob": "14-05-1988"
        })
        print(f"Status: {res.status_code}")
        print(f"Response: {json.dumps(res.json(), indent=2)}")
        assert res.status_code == 200
        assert res.json().get("success") is True
        assert res.json().get("report_status") == "Ready"
        print("--> PASS")

        # -------------------------------------------------------------
        # TEST 4: Report Status API - POST with Year only (1988)
        # -------------------------------------------------------------
        print("\n[TEST 4] POST /reports/status (Unversioned Alias) with 4-digit Year DOB")
        res = await client.post("/reports/status", json={
            "phone": "9820154321",
            "dob": "1988"
        })
        print(f"Status: {res.status_code}")
        print(f"Response: {json.dumps(res.json(), indent=2)}")
        assert res.status_code == 200
        assert res.json().get("success") is True
        print("--> PASS")

        # -------------------------------------------------------------
        # TEST 5: Report Status API - Negative Test: DOB Mismatch Detection
        # -------------------------------------------------------------
        print("\n[TEST 5] POST /api/reports/status with INCORRECT DOB (dob: 2005-01-01)")
        res = await client.post("/api/reports/status", json={
            "phone": "9820154321",
            "dob": "2005-01-01"
        })
        print(f"Status: {res.status_code}")
        print(f"Response: {json.dumps(res.json(), indent=2)}")
        assert res.json().get("success") is False
        assert res.json().get("status") == "IDENTITY_VERIFICATION_FAILED"
        print("--> PASS (Correctly rejected with IDENTITY_VERIFICATION_FAILED)")

        # -------------------------------------------------------------
        # TEST 6: Report Status API - Lookup by Report ID
        # -------------------------------------------------------------
        print("\n[TEST 6] GET /diagnostic-reports/status?report_id=RPT-2001")
        res = await client.get("/diagnostic-reports/status?report_id=RPT-2001")
        print(f"Status: {res.status_code}")
        print(f"Response: {json.dumps(res.json(), indent=2)}")
        assert res.status_code == 200
        assert res.json().get("report_id") == "RPT-2001"
        print("--> PASS")

        # -------------------------------------------------------------
        # TEST 7: Callback API - POST standard Sarvam payload (no preferred_time)
        # -------------------------------------------------------------
        print("\n[TEST 7] POST /api/v1/enquiries/callback - Standard Sarvam payload")
        sarvam_payload = {
            "patient_name": "Sarah O'Connor",
            "phone_number": "+91 98765 43210",
            "callback_reason": "Need to consult doctor regarding lipid report"
        }
        res = await client.post("/api/v1/enquiries/callback", json=sarvam_payload)
        print(f"Status: {res.status_code}")
        print(f"Response: {json.dumps(res.json(), indent=2)}")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        assert res.json().get("success") is True
        assert res.json().get("status") == "QUEUED_FOR_CLINIC_STAFF"
        cb_id_1 = res.json().get("callback_id")
        assert cb_id_1 is not None
        print(f"--> PASS (Saved callback ID: {cb_id_1})")

        # -------------------------------------------------------------
        # TEST 8: Callback API - POST via /callback alias with English/Latin Name
        # -------------------------------------------------------------
        print("\n[TEST 8] POST /callback (Alias) - Latin name with accents & punctuation")
        latin_payload = {
            "name": "Dr. Jean-Luc Renée",
            "phone": "9845011223",
            "reason": "Billing and OPD fee enquiry"
        }
        res = await client.post("/callback", json=latin_payload)
        print(f"Status: {res.status_code}")
        print(f"Response: {json.dumps(res.json(), indent=2)}")
        assert res.status_code == 200
        assert res.json().get("success") is True
        cb_id_2 = res.json().get("callback_id")
        print(f"--> PASS (Saved callback ID: {cb_id_2})")

        # -------------------------------------------------------------
        # TEST 9: Callback API - GET request via /api/callback
        # -------------------------------------------------------------
        print("\n[TEST 9] GET /api/callback (Alias with query parameters)")
        res = await client.get("/api/callback?patient_name=Ananya+Deshmukh&phone_number=8897371942&callback_reason=Schedule+review")
        print(f"Status: {res.status_code}")
        print(f"Response: {json.dumps(res.json(), indent=2)}")
        assert res.status_code == 200
        assert res.json().get("success") is True
        print("--> PASS")

        # -------------------------------------------------------------
        # TEST 10: Verify records in MongoDB
        # -------------------------------------------------------------
        print("\n[TEST 10] Verifying saved records directly in MongoDB 'enquiries' collection...")
        saved_rec = await db["enquiries"].find_one({"callback_id": cb_id_1}, {"_id": 0})
        print("MongoDB Record for Sarah O'Connor:", json.dumps(saved_rec, indent=2))
        assert saved_rec is not None
        assert saved_rec.get("name") == "Sarah O'Connor"
        assert saved_rec.get("status") == "QUEUED_FOR_CLINIC_STAFF"
        print("--> PASS (Record verified in MongoDB)")

    await close_mongo_connection()
    print("\n" + "=" * 70)
    print("ALL 10 TESTS PASSED SUCCESSFULLY! ZERO ERRORS.")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_tests())
