from fastapi import FastAPI
from .routers import materials, shelf, library, search

app = FastAPI(
    title="School Online Library API",
    description="A centralized, policy-driven library system.",
    version="1.0.0"
)

# Include Routers
app.include_router(materials.router)
app.include_router(shelf.router)
app.include_router(library.router)
app.include_router(search.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the School Online Library System API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
