import asyncio
import httpx
import json
from app.main import app
from app.core.database import connect_to_mongo, close_mongo_connection, get_database

async def run_suite():
    print("=" * 75)
    print("CARECONNECT AI - PRODUCTION CANCELLATION & VERIFICATION TEST SUITE")
    print("=" * 75)

    await connect_to_mongo()
    db = get_database()

    # Re-seed active test appointment APT-7829104 before testing
    await db['appointments'].update_one(
        {"reference_id": "APT-7829104"},
        {"$set": {
            "reference_id": "APT-7829104",
            "patient_name": "Manan",
            "phone": "9876543210",
            "doctor_name": "Dr. Samir Verma",
            "clinic_code": "CARE-IND-01",
            "preferred_date": "2026-11-02",
            "preferred_time": "11:00 AM",
            "status": "VERIFIED_CONFIRMED"
        }},
        upsert=True
    )

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:

        # ----------------------------------------------------------------------
        # TEST 1: Exact Sarvam Production Request: PATCH /api/v1/appointments/{ref}/cancel
        # ----------------------------------------------------------------------
        print("\n[TEST 1] PATCH /api/v1/appointments/APT-7829104/cancel")
        patch_payload = {"reference_id": "APT-7829104"}
        res1 = await client.patch("/api/v1/appointments/APT-7829104/cancel", json=patch_payload)
        print(f"Status Code: {res1.status_code}")
        print(f"Response: {json.dumps(res1.json(), indent=2)}")
        assert res1.status_code == 200, f"Expected 200, got {res1.status_code}"
        d1 = res1.json()
        assert d1.get("success") is True
        assert d1.get("status") == "CANCELLED"
        assert d1.get("reference_id") == "APT-7829104"
        print("--> PASS (Cancellation succeeded with HTTP 200)")

        # ----------------------------------------------------------------------
        # TEST 2: Verify database record directly in MongoDB
        # ----------------------------------------------------------------------
        print("\n[TEST 2] Verifying APT-7829104 status directly in MongoDB Atlas...")
        db_doc = await db['appointments'].find_one({"reference_id": "APT-7829104"}, {"_id": 0})
        print(f"MongoDB Record: {json.dumps(db_doc, indent=2)}")
        assert db_doc is not None
        assert db_doc.get("status") == "CANCELLED", f"Expected CANCELLED in DB, got {db_doc.get('status')}"
        print("--> PASS (Database record confirmed CANCELLED in MongoDB)")

        # ----------------------------------------------------------------------
        # TEST 3: Already-Cancelled Appointment Handling
        # ----------------------------------------------------------------------
        print("\n[TEST 3] PATCH /api/v1/appointments/APT-7829104/cancel (Already Cancelled)")
        res3 = await client.patch("/api/v1/appointments/APT-7829104/cancel", json=patch_payload)
        print(f"Status Code: {res3.status_code}")
        print(f"Response: {json.dumps(res3.json(), indent=2)}")
        assert res3.status_code == 200
        d3 = res3.json()
        assert d3.get("success") is False
        assert d3.get("status") == "ALREADY_CANCELLED"
        print("--> PASS (Correctly identified ALREADY_CANCELLED)")

        # ----------------------------------------------------------------------
        # TEST 4: Invalid Appointment ID Handling
        # ----------------------------------------------------------------------
        print("\n[TEST 4] PATCH /api/v1/appointments/APT-NONEXISTENT/cancel (Invalid Reference)")
        res4 = await client.patch("/api/v1/appointments/APT-NONEXISTENT/cancel", json={"reference_id": "APT-NONEXISTENT"})
        print(f"Status Code: {res4.status_code}")
        print(f"Response: {json.dumps(res4.json(), indent=2)}")
        assert res4.status_code == 200
        d4 = res4.json()
        assert d4.get("success") is False
        assert d4.get("status") == "NOT_FOUND"
        print("--> PASS (Correctly identified NOT_FOUND)")

        # ----------------------------------------------------------------------
        # TEST 5: Doctor Mapping - Dr. Samir Verification
        # ----------------------------------------------------------------------
        print("\n[TEST 5] Checking Doctor Availability for 'Dr. Samir'")
        res5 = await client.get("/api/v1/appointments/check-availability?doctor_name=Dr.+Samir")
        print(f"Status Code: {res5.status_code}")
        print(f"Response: {json.dumps(res5.json(), indent=2)}")
        assert res5.status_code == 200
        d5 = res5.json().get("data", {})
        assert "Samir" in d5.get("doctor_name", ""), f"Expected Dr. Samir, got {d5.get('doctor_name')}"
        assert "Rajesh" not in d5.get("doctor_name", ""), "Error: Still substituting with Dr. Rajesh Sharma!"
        print(f"--> PASS (Correctly matched {d5.get('doctor_name')})")

        # ----------------------------------------------------------------------
        # TEST 6: Doctor Mapping - Unknown Doctor No Silent Substitution
        # ----------------------------------------------------------------------
        print("\n[TEST 6] Checking Doctor Availability for unknown doctor 'Dr. NonExistentDoctor'")
        res6 = await client.get("/api/v1/appointments/check-availability?doctor_name=Dr.+NonExistentDoctor")
        print(f"Status Code: {res6.status_code}")
        print(f"Response: {json.dumps(res6.json(), indent=2)}")
        d6 = res6.json().get("data", {})
        assert d6.get("available") is False
        assert d6.get("status") == "DOCTOR_NOT_FOUND"
        print("--> PASS (No silent substitution)")

        # ----------------------------------------------------------------------
        # TEST 7: Callback Response - callback_id Exposed to Sarvam
        # ----------------------------------------------------------------------
        print("\n[TEST 7] Checking Callback Response for explicit callback_id exposure")
        cb_payload = {
            "caller_name": "Manan",
            "caller_phone": "9876543210",
            "preferred_time": "today after 12 PM",
            "reason": "checking blood test report status"
        }
        res7 = await client.post("/api/v1/enquiries/callback", json=cb_payload)
        print(f"Status Code: {res7.status_code}")
        d7 = res7.json()
        print(f"Response: {json.dumps(d7, indent=2)}")
        assert res7.status_code == 200
        cb_id = d7.get("callback_id")
        assert cb_id is not None and cb_id.startswith("CB-")
        assert cb_id in d7.get("message", ""), "callback_id must be exposed in the conversational message!"
        print(f"--> PASS (callback_id {cb_id} exposed at root and in spoken message)")

    await close_mongo_connection()
    print("\n" + "=" * 75)
    print("ALL 7 VERIFICATION TESTS COMPLETED WITH 100% SUCCESS!")
    print("=" * 75)

if __name__ == "__main__":
    asyncio.run(run_suite())

