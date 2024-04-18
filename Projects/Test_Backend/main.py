from fastapi import FastAPI, UploadFile, File, Form
import uvicorn
from pydantic import BaseModel
import os
from typing import Annotated
import numpy as np
import cv2

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
    return "HELLO CLIENT"


def calculate_sha256(data):
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


def get_mask(input_image):
    rmbg_image = carvekit_processor([input_image.resize((2048, 2048))])[0]
    bg = np.array(rmbg_image)
    mask_image = PIL.Image.fromarray(cv2.bitwise_not(bg[:, :, 3]))
    return mask_image


# helper image utils
def encode_image(image_path):
    with open(image_path, "rb") as i:
        b64 = base64.b64encode(i.read())
        result = b64.decode("utf-8")
    return result


def predict(prompt, negative_prompt, image_path, mask_image_path):
    image = encode_image(image_path)
    mask_image = encode_image(mask_image_path)

    # prepare sample payload
    request = {
        "inputs": prompt,
        "image": image,
        "mask_image": mask_image,
        "negative_prompt": negative_prompt,
        "num_images": 1,
    }

    # headers
    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    response = requests.post(ENDPOINT_URL, headers=headers, json=request)

    img_dict = json.loads(response.content.decode())

    return img_dict


@app.post("/post_request")
async def receive_image(
    token: Annotated[str, Form()],
    prompt: Annotated[str, Form()],
    negative_prompt: Annotated[str, Form()],
    img_file: Annotated[UploadFile, File()],
):
    # Validate token
    if not await validate_token(token):
        return return_response_handler()

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

        # Save image mask (DEBUG)
        image_mask_path = input_image_path.rsplit(".", 1)[0] + "_mask" + ".png"
        image_mask.save(image_mask_path)

        output_base64_image_dictionary = predict(
            prompt, negative_prompt, input_image_path, image_mask_path
        )

        return output_base64_image_dictionary
    except:
        return return_response_handler()


def main():
    initialize_model()
    uvicorn.run("main:app", host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
