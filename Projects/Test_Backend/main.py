import requests
from fastapi import FastAPI
import uvicorn

app = FastAPI()
base_url = "https://dummyjson.com/carts"


@app.get("/")
async def root():
    # response = requests.get("")
    # results = response.json()
    return "HELLO CLIENT"

@app.post("/post_image")
async def receive_image(request):
    print(request)


def main():
    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
