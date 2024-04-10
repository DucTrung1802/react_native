from fastapi import FastAPI, UploadFile, File
import uvicorn
from pydantic import BaseModel
import time
import os

app = FastAPI()
base_url = "https://dummyjson.com/carts"


class Request(BaseModel):
    jwt: str
    image: str


@app.get("/")
async def root():
    # response = requests.get("")
    # results = response.json()
    return "HELLO CLIENT"


@app.post("/post_image")
async def receive_image(request: Request):
    jwt = request.jwt
    image = request.image
    time.sleep(3)
    return {
        "jwt": jwt,
        "image": image,
    }


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
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    main()
