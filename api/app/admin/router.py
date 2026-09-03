from fastapi import APIRouter, Depends

from app.admin import crm, fuentes_sync
from app.auth.dependencies import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(require_admin)])

router.include_router(crm.router)
router.include_router(fuentes_sync.router)
