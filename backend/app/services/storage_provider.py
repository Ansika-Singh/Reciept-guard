import os
import shutil
import httpx
from typing import Optional, Dict, Any
from app.config import settings

def is_safe_path(base_dir: str, target_path: str) -> bool:
    """Guards against directory traversal attacks by validating path confinement."""
    real_base = os.path.realpath(base_dir)
    real_target = os.path.realpath(target_path)
    return os.path.commonpath([real_base]) == os.path.commonpath([real_base, real_target])

class BaseStorageProvider:
    def store_file(self, temp_path: str, shopper_id: str, storage_key: str) -> Dict[str, Any]:
        raise NotImplementedError

    def retrieve_file_path(self, storage_key: str) -> Optional[str]:
        raise NotImplementedError

    def retrieve_file_bytes(self, storage_key: str) -> Optional[bytes]:
        raise NotImplementedError


class LocalStorageProvider(BaseStorageProvider):
    def __init__(self, base_dir: Optional[str] = None):
        self.base_dir = base_dir or settings.VAULT_DIR
        try:
            os.makedirs(self.base_dir, exist_ok=True)
        except Exception:
            pass

    def store_file(self, temp_path: str, shopper_id: str, storage_key: str) -> Dict[str, Any]:
        destination = os.path.join(self.base_dir, storage_key)
        dest_dir = os.path.dirname(destination)
        
        # Verify confinement
        if not is_safe_path(self.base_dir, destination):
            raise PermissionError("Path traversal detected in storage key.")

        os.makedirs(dest_dir, exist_ok=True)
        shutil.copy2(temp_path, destination)

        return {
            "storage_key": storage_key,
            "local_path": destination,
            "is_remote": False
        }

    def retrieve_file_path(self, storage_key: str) -> Optional[str]:
        target = os.path.join(self.base_dir, storage_key)
        if not is_safe_path(self.base_dir, target):
            return None
        if os.path.exists(target):
            return target
        return None

    def retrieve_file_bytes(self, storage_key: str) -> Optional[bytes]:
        target = self.retrieve_file_path(storage_key)
        if target and os.path.exists(target):
            with open(target, "rb") as f:
                return f.read()
        return None


class SupabaseStorageProvider(BaseStorageProvider):
    """
    Object storage provider using Supabase Storage REST API.
    Zero heavy AWS/boto3 dependencies; uses built-in httpx.
    """
    def __init__(
        self,
        supabase_url: str,
        service_role_key: str,
        bucket: str = "receipt-vault"
    ):
        self.supabase_url = supabase_url.rstrip("/")
        self.key = service_role_key
        self.bucket = bucket
        self.local_cache = LocalStorageProvider(base_dir="/tmp/vault")

    def store_file(self, temp_path: str, shopper_id: str, storage_key: str) -> Dict[str, Any]:
        # Always cache in /tmp for fast immediate read
        self.local_cache.store_file(temp_path, shopper_id, storage_key)

        try:
            url = f"{self.supabase_url}/storage/v1/object/{self.bucket}/{storage_key}"
            headers = {
                "Authorization": f"Bearer {self.key}",
                "apikey": self.key
            }
            with open(temp_path, "rb") as f:
                content = f.read()

            with httpx.Client(timeout=15.0) as client:
                res = client.post(url, headers=headers, content=content)
                if res.status_code in (200, 201):
                    return {
                        "storage_key": storage_key,
                        "url": url,
                        "is_remote": True
                    }
        except Exception as e:
            print(f"Supabase storage upload notice: {e}")

        return {
            "storage_key": storage_key,
            "local_path": os.path.join("/tmp/vault", storage_key),
            "is_remote": False
        }

    def retrieve_file_path(self, storage_key: str) -> Optional[str]:
        # Check local /tmp cache first
        cached = self.local_cache.retrieve_file_path(storage_key)
        if cached:
            return cached

        # Otherwise download from Supabase into /tmp
        b = self.retrieve_file_bytes(storage_key)
        if b:
            dest = os.path.join("/tmp/vault", storage_key)
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            with open(dest, "wb") as f:
                f.write(b)
            return dest
        return None

    def retrieve_file_bytes(self, storage_key: str) -> Optional[bytes]:
        cached = self.local_cache.retrieve_file_bytes(storage_key)
        if cached:
            return cached

        try:
            url = f"{self.supabase_url}/storage/v1/object/{self.bucket}/{storage_key}"
            headers = {
                "Authorization": f"Bearer {self.key}",
                "apikey": self.key
            }
            with httpx.Client(timeout=15.0) as client:
                res = client.get(url, headers=headers)
                if res.status_code == 200:
                    return res.content
        except Exception as e:
            print(f"Supabase storage download notice: {e}")

        return None


def get_storage_provider() -> BaseStorageProvider:
    if settings.STORAGE_PROVIDER == "supabase" and settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
        return SupabaseStorageProvider(
            supabase_url=settings.SUPABASE_URL,
            service_role_key=settings.SUPABASE_SERVICE_ROLE_KEY,
            bucket=settings.SUPABASE_STORAGE_BUCKET
        )
    return LocalStorageProvider()

storage_provider = get_storage_provider()
