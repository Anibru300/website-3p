from fastapi import APIRouter, Depends

from app.admin import crm
from app.auth.dependencies import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_admin)])

router.include_router(crm.router)
