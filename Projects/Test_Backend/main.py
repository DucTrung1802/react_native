from fastapi import FastAPI, UploadFile, File, Form
import uvicorn
from pydantic import BaseModel
import os
from typing import Annotated
import numpy as np
import cv2
import torch

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
from io import BytesIO
from RealESRGAN import RealESRGAN

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

app = FastAPI()

VALIDATE_TOKEN_URL = (
    "https://raw.githubusercontent.com/DucTrung1802/gcp_ip/main/gcp_ip.json"
)
ENDPOINT_URL = "https://sb6zn2j49353q6uf.us-east-1.aws.endpoints.huggingface.cloud"
HF_TOKEN = "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"

# Carvekit model initialization
seg_net = TracerUniversalB7(device=device, batch_size=1)

fba = FBAMatting(device=device, input_tensor_size=2048, batch_size=1)

trimap = TrimapGenerator()

preprocessing = PreprocessingStub()

postprocessing = MattingMethod(
    matting_module=fba, trimap_generator=trimap, device="cpu"
)

interface = Interface(
    pre_pipe=preprocessing, post_pipe=postprocessing, seg_pipe=seg_net
)

# RealESRGAN model initialization
model = RealESRGAN(device, scale=4)

model.load_weights("weights/RealESRGAN_x4.pth", download=True)


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


def get_mask(image):
    """
    return: bg_remove_res_rgb: Ảnh gốc đã xóa background
    mask_image: ảnh mask
    """
    bg = interface([image])[0]
    bg = np.array(bg)
    mask_image = PIL.Image.fromarray(cv2.bitwise_not(bg[:, :, 3]))

    bg_remove_res_rgb = cv2.cvtColor(np.array(bg), cv2.COLOR_RGBA2RGB)
    bg_remove_res_rgb = PIL.Image.fromarray(bg_remove_res_rgb)
    return bg_remove_res_rgb, mask_image


# helper image utils
def encode_image(image):
    buffered = BytesIO()
    image.save(buffered, format="PNG")
    b64 = base64.b64encode(buffered.getvalue())
    result = b64.decode("utf-8")
    return result


def decode_image(img_str):
    base64_image = base64.b64decode(img_str)
    buffer = BytesIO(base64_image)
    image = PIL.Image.open(buffer)
    return image


def predict(prompt, negative_prompt, bg_remove_res_rgb, mask_image):
    bg_remove_res_rgb_str = encode_image(bg_remove_res_rgb)
    mask_image_str = encode_image(mask_image)

    # prepare sample payload
    request = {
        "inputs": prompt,
        "image": bg_remove_res_rgb_str,
        "mask_image": mask_image_str,
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


def scale_images(bg_remove_res_rgb, mask_image, sd_base64_image_dictionary: dict):
    output_base64_image_dictionary = {}
    for key, value in sd_base64_image_dictionary.items():
        sr_image = model.predict(value)
        sr_image = PIL.Image.composite(
            sr_image,
            bg_remove_res_rgb.resize(sr_image.size),
            mask_image.resize(sr_image.size),
        )
        buffered = BytesIO()
        sr_image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue())
        output_base64_image_dictionary[key] = img_str.decode()

    return output_base64_image_dictionary


def log(content: str):
    print("INFO: " + str(content).upper())


@app.post("/post_request")
async def receive_image(
    token: Annotated[str, Form()],
    prompt: Annotated[str, Form()],
    img_file: Annotated[UploadFile, File()],
    negative_prompt: Annotated[str, Form()] = "",
):
    # Validate token
    if not await validate_token(token):
        return return_response_handler()

    log("token is validate")

    # Validate input image
    if img_file.content_type.split("/")[0] != "image":
        return return_response_handler()

    log("input image is validate")

    # Write image file
    log("Start writing image")

    image_name, image_extension = img_file.filename.split(".")

    input_image_path: str = "./images/" + image_name + "." + image_extension
    if os.path.exists("./images") == False:
        os.makedirs("./images")
    with open(input_image_path, "wb") as f:
        f.write(img_file.file.read())

    if not os.path.exists(input_image_path):
        return return_response_handler()

    log("Image is written successfully")

    try:
        input_image = PIL.Image.open(input_image_path)

        # Generate mask
        log("start get_mask()")
        bg_remove_res_rgb, image_mask = get_mask(input_image)
        log("complete get_mask()")

        # For DEBUG only
        # bg_remove_res_rgb_path = input_image_path.rsplit(".", 1)[0] + "_rmbg.png"
        # bg_remove_res_rgb.save(bg_remove_res_rgb_path)

        # image_mask_path = input_image_path.rsplit(".", 1)[0] + "_mask.png"
        # image_mask.save(image_mask_path)

        log("start predict()")
        sd_base64_image_dictionary = predict(
            prompt, negative_prompt, bg_remove_res_rgb, image_mask
        )
        log("complete predict()")

        log("start scale_images()")
        output_base64_image_dictionary = scale_images(
            bg_remove_res_rgb, image_mask, sd_base64_image_dictionary
        )
        log("complete scale_images()")

        return output_base64_image_dictionary

    except:
        log("ERROR - run return_response_handler()")
        return return_response_handler()


def main():
    uvicorn.run("main:app", host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
