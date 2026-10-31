import asyncio
import httpx
import os
import json
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

# Load backend environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from motor.motor_asyncio import AsyncIOMotorClient

async def sync_sarvam_interactions_to_mongo():
    api_key = os.environ.get("SARVAM_API_KEY")
    org_id = os.environ.get("SARVAM_ORG_ID")
    ws_id = os.environ.get("SARVAM_WORKSPACE_ID")
    app_id = os.environ.get("SARVAM_AGENT_ID")
    uri = os.environ.get("MONGODB_URI")
    
    if not all([api_key, org_id, ws_id, app_id, uri]):
        print("Missing required environment variables for Sarvam sync.")
        return

    headers = {"X-API-Key": api_key}
    now = datetime.now(timezone.utc)
    start_dt = (now - timedelta(days=7)).strftime("%Y-%m-%dT%H:%M:%SZ")
    end_dt = (now + timedelta(hours=5)).strftime("%Y-%m-%dT%H:%M:%SZ")

    url = f"https://apps.sarvam.ai/api/analytics/v1/{org_id}/{ws_id}/{app_id}/interactions"
    params = {
        "start_datetime": start_dt,
        "end_datetime": end_dt,
        "include_transcript": "true"
    }

    client = AsyncIOMotorClient(uri)
    db = client.get_default_database()
    
    # Remove any old conflicting prefix
    await db["call_logs"].delete_many({"call_id": "SARVAM-0BD4A240"})

    async with httpx.AsyncClient(timeout=25.0) as http_client:
        try:
            r = await http_client.get(url, headers=headers, params=params)
            if r.status_code != 200:
                print(f"Failed to fetch Sarvam interactions: {r.status_code} {r.text}")
                return
            
            data = r.json()
            items = data.get("items", [])
            print(f"Found {len(items)} interactions in Sarvam.")

            for it in items:
                iid = it.get("interaction_id")
                if not iid:
                    continue

                orig_tx = it.get("original_transcript") or []
                trans_tx = it.get("translate_transcript") or []
                agent_vars = it.get("agent_variables") or {}

                # Build turn-by-turn dialogue
                dialogue = []
                active_tx = orig_tx if orig_tx else trans_tx
                
                # Determine caller name
                caller_name = agent_vars.get("patient_name") or ""
                if not caller_name:
                    all_text = " ".join([t.get("text", "") for t in active_tx])
                    if "राजेश" in all_text or "Rajesh" in all_text:
                        caller_name = "Rajesh"
                    elif "mubeen" in str(agent_vars).lower():
                        caller_name = "Mubeen"
                    else:
                        caller_name = "Caller (Mobile)"

                time_str = "Today"
                start_iso = it.get("start_datetime") or now.isoformat()
                try:
                    dt = datetime.fromisoformat(start_iso.replace("Z", "+00:00"))
                    time_str = dt.strftime("%I:%M %p")
                except Exception:
                    pass

                for turn in active_tx:
                    is_agent = turn.get("role") in ["agent", "assistant"]
                    spk = "Priya" if is_agent else caller_name
                    raw_text = turn.get("text", "").strip()
                    # Sanitize any legacy clinic mentions
                    clean_text = raw_text.replace("Apex Care Clinic", "Apollo Clinic Indiranagar").replace("एपेक्स केयर क्लिनिक", "अपोलो क्लिनिक इंदिरा नगर")
                    dialogue.append({
                        "speaker": spk,
                        "text": clean_text,
                        "time": time_str
                    })

                dur_sec = it.get("duration_in_seconds", 0.0)
                mins = int(dur_sec // 60)
                secs = int(dur_sec % 60)
                dur_str = f"{mins}m {secs}s" if mins > 0 else f"{secs}s"

                direction = (it.get("channel_direction") or "inbound").upper()
                
                summary = agent_vars.get("call_summary") or "Real-time voice conversation with Priya AI receptionist."
                summary = summary.replace("Apex Care Clinic", "Apollo Clinic Indiranagar")

                phone_num = it.get("user_contact") or "+91 80642 69783"

                # Build a unique call_id
                raw_hash = iid.split('/')[-1].replace(':', '').replace('-', '')
                unique_cid = f"SARVAM-{raw_hash[:12].upper()}"

                call_doc = {
                    "call_id": unique_cid,
                    "sarvam_interaction_id": iid,
                    "caller_name": caller_name,
                    "caller_phone": phone_num,
                    "call_direction": direction,
                    "call_purpose": agent_vars.get("call_purpose") or ("Inbound Mobile Phone Call" if direction == "INBOUND" else "Outbound Care Notification"),
                    "doctor_name": agent_vars.get("doctor_name") or "Apollo Clinic Indiranagar",
                    "specialty": "OPD Consultation Desk",
                    "duration": dur_str,
                    "timestamp": f"Today, {time_str}",
                    "outcome": agent_vars.get("call_outcome") or "COMPLETED",
                    "sentiment": "Positive",
                    "summary": summary,
                    "transcript_dialogue": dialogue,
                    "created_at": start_iso if start_iso.endswith("Z") else start_iso + "Z",
                    "updated_at": now.isoformat() + "Z"
                }

                await db["call_logs"].update_one(
                    {"call_id": unique_cid},
                    {"$set": call_doc},
                    upsert=True
                )
                print(f"Synchronized call: {call_doc['call_id']} | {caller_name} | {direction} | {len(dialogue)} turns")

        except Exception as e:
            print(f"Error during Sarvam interaction sync: {e}")

if __name__ == "__main__":
    asyncio.run(sync_sarvam_interactions_to_mongo())
