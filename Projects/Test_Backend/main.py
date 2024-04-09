import requests
from fastapi import FastAPI
import uvicorn

app = FastAPI()
base_url = "https://dummyjson.com/carts"


@app.get("/")
async def root():
    response = requests.get(base_url)
    results = response.json()
    return results


def main():
    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
