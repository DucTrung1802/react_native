import axios from "axios";

const BACKEND_URL = "http://127.0.0.1:8000/"

export async function getString() {
    const response = await axios.get(BACKEND_URL)
    console.log(response)
}