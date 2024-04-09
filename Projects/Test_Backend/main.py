from fastapi import FastAPI
import uvicorn
from pydantic import BaseModel

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


@app.post("/post_image/")
async def receive_image(request: Request):
    jwt = request.jwt
    image = request.image
    return {
        "jwt": jwt,
        "image": image,
    }


def main():
    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
