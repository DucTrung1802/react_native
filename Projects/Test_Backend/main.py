from fastapi import FastAPI
import uvicorn
from pydantic import BaseModel

app = FastAPI()
base_url = "https://dummyjson.com/carts"


class UserCreate(BaseModel):
    user_id: int
    username: str


@app.get("/")
async def root():
    # response = requests.get("")
    # results = response.json()
    return "HELLO CLIENT"


@app.post("/post_image/")
async def receive_image(user_data: UserCreate):
    user_id = user_data.user_id
    username = user_data.username
    return {
        "msg": "we got data succesfully",
        "user_id": user_id,
        "username": username,
    }


def main():
    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
