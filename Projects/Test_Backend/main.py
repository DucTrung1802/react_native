from fastapi import FastAPI, UploadFile, File, Form
import uvicorn
from pydantic import BaseModel
import os
from typing import Annotated
import numpy as np
import cv2
from diffusers.utils import load_image

import PIL.Image
from carvekit.api.interface import Interface
from carvekit.ml.wrap.fba_matting import FBAMatting
from carvekit.ml.wrap.tracer_b7 import TracerUniversalB7
from carvekit.pipelines.postprocessing import MattingMethod
from carvekit.pipelines.preprocessing import PreprocessingStub
from carvekit.trimap.generator import TrimapGenerator

import requests
import hashlib
import json
from io import BytesIO

import base64

app = FastAPI()

VALIDATE_TOKEN_URL = (
    "https://raw.githubusercontent.com/DucTrung1802/gcp_ip/main/gcp_ip.json"
)
ENDPOINT_URL = "https://sb6zn2j49353q6uf.us-east-1.aws.endpoints.huggingface.cloud"
HF_TOKEN = "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"

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


def return_response_handler():
    print("return_response_handler()")
    return False


def carvekit_processing(input_image):
    try:
        rmbg_image = carvekit_processor([input_image])[0]
        return rmbg_image
    except:
        return False


def get_mask(input_image):
    rmbg_image = carvekit_processing(input_image)
    bg = np.array(rmbg_image)
    mask_image = PIL.Image.fromarray(cv2.bitwise_not(bg[:, :, 3]))
    return mask_image


# helper image utils
def encode_image(image):
    return base64.b64encode(image.tobytes()).decode("utf-8")


def predict(prompt, image, mask_image):
    image = encode_image(image)
    mask_image = encode_image(mask_image)

    # prepare sample payload
    request = {"inputs": prompt, "image": image, "mask_image": mask_image}
    # headers
    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    response = requests.post(ENDPOINT_URL, headers=headers, json=request)

    img_dict = json.loads(response.content.decode())
    # images = []
    # for img_str in img_dict.values():
    #     base64_image = base64.b64decode(img_str)
    #     buffer = BytesIO(base64_image)
    #     image = PIL.Image.open(buffer)
    #     images.append(image)

    return img_dict


@app.post("/post_request")
async def receive_image(
    token: Annotated[str, Form()],
    prompt: Annotated[str, Form()],
    img_file: Annotated[UploadFile, File()],
):
    # Validate token
    if not await validate_token(token):
        return return_response_handler()

    # print(token)

    # Validate input image
    if img_file.content_type.split("/")[0] != "image":
        return return_response_handler()

    # Write image file
    image_name, image_extension = img_file.filename.split(".")

    input_image_path: str = "./images/" + image_name + "." + image_extension
    if os.path.exists("./images") == False:
        os.makedirs("./images")
    with open(input_image_path, "wb") as f:
        f.write(img_file.file.read())

    if not os.path.exists(input_image_path):
        return return_response_handler()

    try:
        input_image = PIL.Image.open(input_image_path)

        # Generate mask
        image_mask = get_mask(input_image)

        # # Save image mask (DEBUG)
        # image_mask_path = input_image_path.rsplit(".", 1)[0] + "_mask" + ".png"
        # image_mask.save(image_mask_path)

        output_base64_image_dictionary = predict(prompt, input_image, image_mask)

        os.remove(input_image_path)

        return output_base64_image_dictionary
    except:
        return return_response_handler()


def main():
    initialize_model()
    uvicorn.run("main:app", host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
