from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ChatRequest, ChatResponse
from app.services.llm_service import generate_grounded_answer

router = APIRouter(tags=["Chat"])

@router.post("/chat", response_model=ChatResponse)
def chat_qa(req: ChatRequest, db: Session = Depends(get_db)):
    """
    RAG Assistant endpoint grounded in uploaded receipt, store policy, and order database.
    Strictly prevents hallucinations and answers using verified source citations.
    """
    result = generate_grounded_answer(
        db=db,
        shopper_id=req.shopper_id,
        question=req.question,
        receipt_id=req.receipt_id
    )
    return result
