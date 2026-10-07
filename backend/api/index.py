import sys
import os

# Resolve paths so backend modules import cleanly on Vercel when root is backend
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
root_dir = os.path.dirname(backend_dir)

for p in [backend_dir, root_dir, current_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)

from app.main import app as _fastapi_app
from mangum import Mangum

# Explicit top-level assignments required by Vercel Python AST scanner
app = _fastapi_app
handler = Mangum(app, lifespan="off")
