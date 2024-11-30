# App API imports
from pathlib import Path

# LLM imports
from dotenv import find_dotenv, load_dotenv
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import FileResponse
from ical_events import create_calendar_ics_from_events_list
from langchain_openai.chat_models import ChatOpenAI

# Created function imports
from llm_call import extract_events_from_image

DATA_FOLDER = "/Users/d/git/calendar_reader/data"
FNAME = "calendar_update.ics"
OUT_PATH = Path(DATA_FOLDER, FNAME)

load_dotenv(find_dotenv())

# Instantiate LLM
llm = ChatOpenAI(model="gpt-4o", max_tokens=1024)

app = FastAPI()


@app.post("/upload/")
async def upload_image(file: UploadFile = File(...)):

    # Read the uploaded file
    image_bytes = await file.read()

    # Process the image
    llm_out = extract_events_from_image(llm, image_bytes)
    create_calendar_ics_from_events_list(llm_out, OUT_PATH)

    # Return the processed image as a response
    return FileResponse(OUT_PATH, media_type="application/octet-stream", filename=FNAME)


@app.get("/")
def read_root():
    return {"message": "Welcome to the image processing FastAPI application"}
