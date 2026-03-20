# Emergency Profile Extractor

An AI-powered, real-time medical document extraction tool built for paramedics. Built using FastAPI and Google's Gemini 1.5 Flash model, this application takes chaotic medical records, hand-written prescriptions, and IDs, and instantly generates a structured, verified "Emergency Profile" indicating critical warnings, allergies, medications, and vitals.

## Tech Stack
- **Backend:** FastAPI, Python 3, Pydantic (for strictly-typed JSON schemas)
- **Frontend:** HTML5, Vanilla CSS3 (High-Contrast Paramedic UI), Vanilla JavaScript
- **AI Integration:** `@google/generative-ai` (Gemini 1.5 Flash Vision capabilities)

## Setup and Installation

1. **Navigate to the directory:**
   ```bash
   cd emergency-profile
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables:**
   Create or edit the `.env` file in the root directory and add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

5. **Run the Application:**
   ```bash
   python main.py
   ```
   *(Alternatively, run `uvicorn main:app --host 0.0.0.0 --port 8000 --reload`)*

6. **Usage:**
   Open your browser and navigate to `http://localhost:8000`. Drag and drop medical PDFs, prescription images (JPG/PNG), or text documents into the designated zone. Click "Extract Profile" to instantly generate the patient's dossier.

## Architecture Highlights
- Multi-modal file processing (Images, PDFs, Text) sent directly to Gemini Flash for rapid inference.
- Enforced JSON output using Pydantic schemas via Gemini's `response_schema` parameter.
- Clean, vanilla dependency-free frontend for lightweight and rapid loading in emergency situations.
