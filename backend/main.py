import sys
from pathlib import Path

# Ensure backend root is on sys.path for module resolution
sys.path.insert(0, str(Path(__file__).parent))

from app.main import app

# Root health check endpoint for Vercel service health probes
@app.get("/")
def root_index():
    return {
        "service": "Kadali Fresh Control Tower Backend",
        "status": "OPERATIONAL",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
