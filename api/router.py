from fastapi import APIRouter

from api.v1 import auth, guides, health

api_router = APIRouter(prefix="/api")
api_router.include_router(health.router)
api_router.include_router(auth.router, prefix="/v1")
api_router.include_router(guides.router, prefix="/v1")
