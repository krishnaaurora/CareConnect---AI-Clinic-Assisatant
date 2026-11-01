import uuid
import logging
from datetime import datetime
from typing import Optional, List
from app.modules.enquiries.models import CallbackRequest
from app.modules.enquiries.repository import EnquiryRepository

logger = logging.getLogger(__name__)

class EnquiryService:
    def __init__(self):
        self.repo = EnquiryRepository()

    async def register_callback(self, req: CallbackRequest) -> dict:
        callback_id = f"CB-{uuid.uuid4().hex[:6].upper()}"
        now_iso = datetime.utcnow().isoformat() + "Z"
        
        doc = {
            "id": callback_id,
            "callback_id": callback_id,
            "name": req.name,
            "patient_name": req.patient_name or req.name,
            "phone": req.phone,
            "phone_number": req.phone_number or req.phone,
            "preferred_time": req.preferred_time or "Earliest Available",
            "preferred_language": req.preferred_language or "English",
            "callback_reason": req.callback_reason or req.enquiry_topic or "General Inquiry",
            "enquiry_topic": req.enquiry_topic or req.callback_reason or "General Inquiry",
            "status": "QUEUED_FOR_CLINIC_STAFF",
            "created_at": now_iso,
            "updated_at": now_iso
        }
        logger.info(f"Registering callback in MongoDB: id={callback_id}, patient={doc['patient_name']}, phone={doc['phone']}, reason={doc['callback_reason']}")
        return await self.repo.save_callback(doc)

    async def get_all(self) -> List[dict]:
        return await self.repo.list_recent(limit=50)

    async def update_status(self, callback_id: str, status: str, notes: Optional[str] = None) -> bool:
        return await self.repo.update_status(callback_id, status, notes)

