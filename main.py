"""Application entry point."""

import uvicorn
# from app.index import app

# This is used when running the application directly with Python
if __name__ == "__main__":
    uvicorn.run("app.app:app", host="0.0.0.0", port=8000)
