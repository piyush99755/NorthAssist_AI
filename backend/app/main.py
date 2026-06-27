from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import life_event, letters, resources

app = FastAPI(title="NorthAssist AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "NorthAssist AI API Running"}

app.include_router(life_event.router)
app.include_router(letters.router)
app.include_router(resources.router)