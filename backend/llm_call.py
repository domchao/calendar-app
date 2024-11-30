import base64

from langchain.schema.messages import AIMessage, HumanMessage
from langchain_core.output_parsers import JsonOutputParser
from langchain_openai.chat_models import ChatOpenAI


# Image encoding
def encode_image(image_path):
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode("utf-8")


def convert_image_bytes_to_base64(image_bytes):
    # Encode the bytes to base64
    base64_encoded = base64.b64encode(image_bytes)
    # Convert the base64 bytes to a string
    base64_string = base64_encoded.decode("utf-8")
    return base64_string


# LLM calling
LLM_SYSTEM_MESSAGE = """You are a useful bot that is especially good at OCR from images. You will be sent an image of a calendar and your
task is to identify the handwritten events from the calendar. Some of the writing is clear and some is faint, only return identified  
items where the writing is clear. You must return a list of the identified events. Each event must be returned in JSON format with the
keys; 'event_name', 'event_start', 'event_end'. An example output should look like: 
[{"event_name": "Meeting with Bob", "event_start": "2024-05-30", "event_end": "2024-05-30"}, {"event_name": "James's Party", "event_start": "2024-05-31", "event_end": "2024-05-31"}]"""


def call_llm(llm, encoded_image):
    msg = llm.invoke(
        [
            AIMessage(content=LLM_SYSTEM_MESSAGE),
            HumanMessage(
                content=[
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{encoded_image}"},
                    },
                ]
            ),
        ]
    )
    return msg


def parse_llm_output(llm_output_string):
    parser = JsonOutputParser()
    parsed_output = parser.parse(llm_output_string)
    return parsed_output


# def extract_events_from_image(llm, image_path):
#     encoded_image = encode_image(image_path)
#     llm_output = call_llm(llm, encoded_image)
#     llm_output_content = llm_output.content
#     events = parse_llm_output(llm_output_content)
#     return events


def extract_events_from_image(llm, img_bytes):
    # encoded_image = encode_image(image_path)
    encoded_image = convert_image_bytes_to_base64(img_bytes)
    llm_output = call_llm(llm, encoded_image)
    llm_output_content = llm_output.content
    events = parse_llm_output(llm_output_content)
    return events
