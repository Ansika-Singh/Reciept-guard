from sqlalchemy.orm import Session
from app.models import StorePolicy, PolicySection
from typing import Optional, Dict, Any, List

def get_policy_for_item(
    db: Session,
    store_name: str,
    category: str,
    policy_type: str = "return"
) -> Optional[PolicySection]:
    """
    Finds the exact policy section for a given store, item category, and policy_type.
    Does not fall back to unrelated store policies.
    """
    # 1. Look up policy for store
    policy = db.query(StorePolicy).filter(StorePolicy.store.ilike(store_name)).first()
    if not policy:
        return None

    # 2. Look up section matching category and policy_type
    section = db.query(PolicySection).filter(
        PolicySection.policy_id == policy.policy_id,
        PolicySection.category.ilike(category),
        PolicySection.policy_type.ilike(policy_type)
    ).first()

    if not section:
        # Fallback to category 'All' if defined for this store
        section = db.query(PolicySection).filter(
            PolicySection.policy_id == policy.policy_id,
            PolicySection.category.ilike("All"),
            PolicySection.policy_type.ilike(policy_type)
        ).first()

    return section

def get_all_store_policies(db: Session, store_name: Optional[str] = None) -> List[StorePolicy]:
    query = db.query(StorePolicy)
    if store_name:
        query = query.filter(StorePolicy.store.ilike(store_name))
    return query.all()
