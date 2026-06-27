import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import life_event, letters, resources

app = FastAPI(title="NorthAssist AI API")

_cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000",
)
_origins = [origin.strip() for origin in _cors_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "NorthAssist AI API Running"}

app.include_router(life_event.router)
app.include_router(letters.router)
app.include_router(resources.router)