import requests
from fastapi import FastAPI

app = FastAPI()
base_url = "https://dummyjson.com/carts"


@app.get("/")
async def root():
    response = requests.get(base_url)
    results = response.json()
    return results
