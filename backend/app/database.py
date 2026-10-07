from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# SQLite specific connect args
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def init_db():
    try:
        import app.models  # Ensures all ORM models are registered with Base.metadata
    except Exception as e:
        print(f"Model import notice: {e}")
    Base.metadata.create_all(bind=engine)
    # Lightweight SQLite column schema sync (only applies to SQLite)
    if not settings.DATABASE_URL.startswith("sqlite"):
        return

    try:
        raw_conn = engine.raw_connection()
        cur = raw_conn.cursor()
        
        # 1. receipts
        cur.execute("PRAGMA table_info(receipts)")
        existing_cols = {row[1] for row in cur.fetchall()}
        new_receipt_cols = [
            ("original_filename", "TEXT"),
            ("storage_key", "TEXT"),
            ("file_type", "TEXT"),
            ("mime_type", "TEXT"),
            ("file_size", "INTEGER"),
            ("file_hash", "TEXT"),
            ("status", "TEXT DEFAULT 'CONFIRMED'"),
            ("extraction_status", "TEXT DEFAULT 'COMPLETED'"),
            ("verification_status", "TEXT DEFAULT 'VERIFIED'"),
            ("is_archived", "BOOLEAN DEFAULT 0"),
            ("confirmed_at", "DATETIME"),
            ("seller_name", "TEXT"),
            ("buyer_name", "TEXT"),
            ("sale_id", "TEXT"),
            ("amount_in_words", "TEXT"),
            ("printed_return_policy", "TEXT"),
            ("warranty_information", "TEXT")
        ]
        for col_name, col_type in new_receipt_cols:
            if col_name not in existing_cols:
                cur.execute(f"ALTER TABLE receipts ADD COLUMN {col_name} {col_type}")
        
        # 2. receipt_items
        cur.execute("PRAGMA table_info(receipt_items)")
        existing_item_cols = {row[1] for row in cur.fetchall()}
        new_item_cols = [
            ("description", "TEXT"),
            ("sku", "TEXT"),
            ("asin", "TEXT"),
            ("item_code", "TEXT"),
            ("hsn", "TEXT"),
            ("discount_percent", "REAL"),
            ("discount_amount", "REAL"),
            ("tax_rate", "REAL"),
            ("tax_type", "TEXT"),
            ("tax_amount", "REAL"),
            ("warranty_information", "TEXT")
        ]
        for col_name, col_type in new_item_cols:
            if col_name not in existing_item_cols:
                cur.execute(f"ALTER TABLE receipt_items ADD COLUMN {col_name} {col_type}")

        # 3. receipt_drafts
        cur.execute("PRAGMA table_info(receipt_drafts)")
        existing_draft_cols = {row[1] for row in cur.fetchall()}
        new_draft_cols = [
            ("seller_name", "TEXT"),
            ("buyer_name", "TEXT"),
            ("sale_id", "TEXT"),
            ("amount_in_words", "TEXT"),
            ("printed_return_policy", "TEXT"),
            ("warranty_information", "TEXT")
        ]
        for col_name, col_type in new_draft_cols:
            if col_name not in existing_draft_cols:
                cur.execute(f"ALTER TABLE receipt_drafts ADD COLUMN {col_name} {col_type}")

        # 4. receipt_items_drafts
        cur.execute("PRAGMA table_info(receipt_items_drafts)")
        existing_draft_item_cols = {row[1] for row in cur.fetchall()}
        for col_name, col_type in new_item_cols:
            if col_name not in existing_draft_item_cols:
                cur.execute(f"ALTER TABLE receipt_items_drafts ADD COLUMN {col_name} {col_type}")

        raw_conn.commit()
        raw_conn.close()
    except Exception as e:
        print(f"Database schema sync notice: {e}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
