import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai

load_dotenv()

app = FastAPI(title="ShieldChat API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str
    security_status: str
    risk_level: str


def security_check(message: str) -> dict:
    # TODO: Integrate the real prompt-injection security package here.
    # This placeholder does NOT provide actual prompt-injection protection.
    return {
        "allowed": True,
        "risk_level": "not_evaluated",
    }


@app.get("/")
def home():
    return {"message": "ShieldChat backend is running!"}


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    message = request.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty.",
        )

    security_result = security_check(message)

    if not security_result["allowed"]:
        return ChatResponse(
            reply="This message was blocked by the security check.",
            security_status="blocked",
            risk_level=security_result["risk_level"],
        )

    api_key = os.getenv("GEMINI_API_KEY")
    model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is missing from the backend .env file.",
        )

    try:
        client = genai.Client(api_key=api_key)

        response = client.models.generate_content(
            model=model,
            contents=message,
        )

        reply = response.text or "The model returned an empty response."

        return ChatResponse(
            reply=reply,
            security_status="not_evaluated",
            risk_level=security_result["risk_level"],
        )

    except Exception as error:
        print("Gemini error type:", type(error).__name__)
        print("Gemini error details:", str(error))

        raise HTTPException(
            status_code=502,
            detail="Gemini request failed. Check the backend terminal for details.",
        )