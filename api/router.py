from fastapi import APIRouter

from api.v1 import auth, health

api_router = APIRouter(prefix="/api")
api_router.include_router(health.router)
api_router.include_router(auth.router, prefix="/v1")
