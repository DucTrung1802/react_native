from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse, StreamingResponse
import uvicorn
from pydantic import BaseModel
import os
from typing import Annotated

import PIL.Image
from carvekit.api.interface import Interface
from carvekit.ml.wrap.fba_matting import FBAMatting
from carvekit.ml.wrap.tracer_b7 import TracerUniversalB7
from carvekit.pipelines.postprocessing import MattingMethod
from carvekit.pipelines.preprocessing import PreprocessingStub
from carvekit.trimap.generator import TrimapGenerator

import requests
import hashlib

import base64

app = FastAPI()
VALIDATE_TOKEN_URL = (
    "https://raw.githubusercontent.com/DucTrung1802/gcp_ip/main/gcp_ip.json"
)

seg_net = TracerUniversalB7(device="cpu", batch_size=1)

fba = FBAMatting(device="cpu", input_tensor_size=2048, batch_size=1)

trimap = TrimapGenerator()

preprocessing = PreprocessingStub()

postprocessing = MattingMethod(
    matting_module=fba, trimap_generator=trimap, device="cpu"
)

carvekit_processor = Interface(
    pre_pipe=preprocessing, post_pipe=postprocessing, seg_pipe=seg_net
)


def initialize_model():
    global carvekit_processor
    pass


class Request(BaseModel):
    jwt: Annotated[str, Form()]
    image: Annotated[str, Form()]


@app.get("/")
async def root():
    # response = requests.get("")
    # results = response.json()
    return "HELLO CLIENT"


def calculate_sha256(data):
    # Convert data to bytes if it’s not already
    if isinstance(data, str):
        data = data.encode()

    # Calculate SHA-256 hash
    sha256_hash = hashlib.sha256(data).hexdigest()

    return sha256_hash


async def validate_token(token: str):
    response = requests.get(VALIDATE_TOKEN_URL)
    server_ip = response.json()
    if server_ip and server_ip["ip"]:
        server_token = calculate_sha256(server_ip["ip"])

        if server_token == token:
            return True

    return False


async def carvekit_processing(input_image_path):
    try:
        input_image = PIL.Image.open(input_image_path)
        output_image = carvekit_processor([input_image])[0]
        output_image_path = input_image_path.rsplit(".", 1)[0] + "_rmbg" + ".png"
        output_image.save(output_image_path)
        return output_image_path
    except:
        return False


def return_response_handler():
    print("return_response_handler()")
    return False


@app.post("/post_request")
async def receive_image(
    token: Annotated[str, Form()],
    prompt: Annotated[str, Form()],
    img_file: Annotated[UploadFile, File()],
):
    # Validate token
    if not await validate_token(token):
        return return_response_handler()

    print(token)

    # Validate input image
    if img_file.content_type.split("/")[0] != "image":
        return return_response_handler()

    # Validate image file
    input_image_path: str = "./images/" + img_file.filename
    if os.path.exists("./images") == False:
        os.makedirs("./images")
    with open(input_image_path, "wb") as f:
        f.write(img_file.file.read())

    if not os.path.exists(input_image_path):
        return return_response_handler()

    # Process image
    output_image_path = await carvekit_processing(input_image_path)
    if not os.path.exists(output_image_path):
        return return_response_handler()

    print("Success")

    # Convert the image to base64 format
    with open(output_image_path, "rb") as f:
        encoded_image = base64.b64encode(f.read())

    os.remove(input_image_path)

    return encoded_image


def main():
    initialize_model()
    uvicorn.run("main:app", host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
