import asyncio
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from motor.motor_asyncio import AsyncIOMotorClient

async def purge_dummy():
    uri = os.environ.get('MONGODB_URI')
    client = AsyncIOMotorClient(uri)
    db = client.get_default_database()

    # Delete all BOLNA-CALL- and SARVAM-CALL-71 mock entries
    r1 = await db['call_logs'].delete_many({'call_id': {'$regex': r'^BOLNA-'}})
    r2 = await db['call_logs'].delete_many({'call_id': {'$regex': r'^SARVAM-CALL-71'}})
    r3 = await db['call_logs'].delete_many({'call_id': {'$in': ['SARVAM-D53CBF91', 'SARVAM-9F6D47A8']}})

    print(f"Purged {r1.deleted_count} BOLNA dummy calls.")
    print(f"Purged {r2.deleted_count} SARVAM mock seeded calls.")
    print(f"Purged {r3.deleted_count} empty attempt calls.")

    print("\n--- Remaining Real Calls in call_logs ---")
    async for c in db['call_logs'].find().sort('created_at', -1):
        cid = c.get('call_id')
        name = c.get('caller_name')
        direction = c.get('call_direction')
        diag = c.get('transcript_dialogue') or []
        print(f"Real Call: {cid} | {name} | {direction} | {len(diag)} turns")

if __name__ == '__main__':
    asyncio.run(purge_dummy())
