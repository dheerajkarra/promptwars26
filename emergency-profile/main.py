import os
import io
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import List, Optional
import google.generativeai as genai
from dotenv import load_dotenv
from PIL import Image

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if api_key and api_key != "your_mock_key_here":
    genai.configure(api_key=api_key)

app = FastAPI(title="Emergency Profile App")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_root():
    with open("static/index.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

class EmergencyProfile(BaseModel):
    name: str = Field(description="Patient's full name, or 'Unknown' if not found")
    age: str = Field(description="Patient's age or date of birth, or 'Unknown'")
    blood_type: str = Field(description="Blood type (e.g. O+, A-), or 'Unknown'")
    allergies: List[str] = Field(description="List of discovered allergies, or empty list")
    chronic_conditions: List[str] = Field(description="List of chronic medical conditions, or empty")
    current_medications: List[str] = Field(description="List of current medications with dosages if available, or empty")
    emergency_contacts: List[str] = Field(description="List of emergency contacts (Name & Phone), or empty")
    critical_warnings: List[str] = Field(description="Any critical immediate warnings for paramedics, or empty")

@app.post("/api/extract")
async def extract_profile(files: List[UploadFile] = File(...)):
    if not api_key or api_key == "your_mock_key_here":
        raise HTTPException(status_code=500, detail="Gemini API Key not configured on the server. Please add it to the .env file.")
        
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        contents = []
        prompt_text = (
            "You are an expert AI medical assistant for emergency paramedics. "
            "You have been handed a chaotic pile of medical documents, prescriptions, and lab results. "
            "Analyze all the provided images/documents and extract the patient's critical medical information. "
            "Output the results STRICTLY as JSON matching the requested schema."
        )
        contents.append(prompt_text)
        
        for file in files:
            content = await file.read()
            if file.content_type and file.content_type.startswith("image/"):
                try:
                    img = Image.open(io.BytesIO(content))
                    contents.append(img)
                except Exception as e:
                    print(f"Error opening image: {e}")
            elif file.content_type == "application/pdf":
                contents.append({
                    "mime_type": "application/pdf",
                    "data": content
                })
            else:
                contents.append(content.decode("utf-8", errors="ignore"))
                
        response = model.generate_content(
            contents,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=EmergencyProfile
            )
        )
        
        profile_data = json.loads(response.text)
        return profile_data
        
    except Exception as e:
        print(f"Extraction Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
