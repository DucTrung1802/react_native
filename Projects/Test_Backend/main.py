from fastapi import FastAPI, UploadFile, File, Form
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

app = FastAPI()
VALIDATE_TOKEN_URL = (
    "https://raw.githubusercontent.com/DucTrung1802/gcp_ip/main/gcp_ip.json"
)


def initialize_carvekit():
    global carvekit_processor
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


class Request(BaseModel):
    jwt: Annotated[str, Form()]
    image: Annotated[str, Form()]


@app.get("/")
async def root():
    # response = requests.get("")
    # results = response.json()
    return "HELLO CLIENT"


async def carvekit_processing(image_path):
    pass


async def validate_token(token: str):
    response = await requests.get(VALIDATE_TOKEN_URL)
    results = response.json()


def return_response_handler():
    print("return_response_handler()")


@app.post("/post_request")
async def receive_image(
    token: Annotated[str, Form()],
    prompt: Annotated[str, Form()],
    img_file: Annotated[UploadFile, File()],
):
    if not validate_token(token):
        return_response_handler()

    print("token: " + token)
    print("prompt: " + prompt)
    print(img_file.content_type)
    if (
        ".jpg" in img_file.filename
        or ".jpeg" in img_file.filename
        or ".png" in img_file.filename
    ):
        file_save_path = "./images/" + img_file.filename
        if os.path.exists("./images") == False:
            os.makedirs("./images")

        with open(file_save_path, "wb") as f:
            f.write(img_file.file.read())

        if os.path.exists(file_save_path):
            return {"image_path": file_save_path, "message": "Image saved successfully"}
        else:
            return {"error": "Image Not saved !!!"}
    else:
        return {"error": "File Type is not valid please upload onyly "}


@app.post("/upload_image")
async def upload_image(img_file: UploadFile = File(...)):
    if (
        ".jpg" in img_file.filename
        or ".jpeg" in img_file.filename
        or ".png" in img_file.filename
    ):
        file_save_path = "./images/" + img_file.filename
        if os.path.exists("./images") == False:
            os.makedirs("./images")

        with open(file_save_path, "wb") as f:
            f.write(img_file.file.read())

        if os.path.exists(file_save_path):
            return {"image_path": file_save_path, "message": "Image saved successfully"}
        else:
            return {"error": "Image Not saved !!!"}
    else:
        return {"error": "File Type is not valid please upload only jpg,jpeg and png"}


def main():
    initialize_carvekit()
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    main()
