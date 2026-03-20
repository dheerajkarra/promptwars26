import os
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

import main
from main import app

# Bypass the global API key check gracefully for the test suite
main.api_key = "mock_key_for_testing_bypass"

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "Paramedic Emergency Profile" in response.text

@patch("main.genai.GenerativeModel")
def test_extract_profile_with_sample_text(mock_model_class):
    # Setup mock Gemini API Response so tests run without real internet/tokens
    mock_model_instance = MagicMock()
    mock_model_class.return_value = mock_model_instance
    
    mock_response = MagicMock()
    mock_response.text = '{"name": "John Doe", "age": "1978-05-12", "blood_type": "O+", "allergies": ["Penicillin", "Peanuts"], "chronic_conditions": ["Type 2 Diabetes", "Hypertension"], "current_medications": ["Metformin 500mg", "Lisinopril 10mg"], "emergency_contacts": ["Jane Doe, Wife, 555-1234"], "critical_warnings": ["Severe anaphylaxis due to peanut allergy"]}'
    mock_model_instance.generate_content.return_value = mock_response

    # Read the actual sample data file we committed
    with open("tests/sample_data/patient_record_1.txt", "rb") as f:
        file_content = f.read()

    files = {"files": ("patient_record_1.txt", file_content, "text/plain")}
    response = client.post("/api/extract", files=files)
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "John Doe"
    assert "Peanuts" in data["allergies"]
    assert "Lisinopril 10mg" in data["current_medications"]

def test_missing_api_key():
    # Ensure our API endpoint throws a 500 if the api_key global is literally empty or mock
    main.api_key = "your_mock_key_here"  # Reset back to failing mock
    files = {"files": ("test.txt", b"test content", "text/plain")}
    response = client.post("/api/extract", files=files)
    assert response.status_code == 500
    assert "Gemini API Key" in response.json()["detail"]
