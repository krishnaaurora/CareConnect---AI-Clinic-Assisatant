import uuid
from datetime import datetime
from typing import Optional, List
from app.modules.enquiries.models import CallbackRequest
from app.modules.enquiries.repository import EnquiryRepository

class EnquiryService:
    def __init__(self):
        self.repo = EnquiryRepository()

    async def register_callback(self, req: CallbackRequest) -> dict:
        callback_id = f"CB-{uuid.uuid4().hex[:6].upper()}"
        doc = {
            "callback_id": callback_id,
            "name": req.name.strip(),
            "phone": req.phone.strip(),
            "preferred_time": req.preferred_time,
            "preferred_language": req.preferred_language,
            "enquiry_topic": req.enquiry_topic,
            "status": "QUEUED_FOR_CLINIC_STAFF",
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        return await self.repo.save_callback(doc)

    async def get_all(self) -> List[dict]:
        return await self.repo.list_recent(limit=50)

    async def update_status(self, callback_id: str, status: str, notes: Optional[str] = None) -> bool:
        return await self.repo.update_status(callback_id, status, notes)
