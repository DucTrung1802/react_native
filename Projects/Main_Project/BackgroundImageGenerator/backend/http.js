import axios from "axios";
import { sha256 } from 'js-sha256'
import { Platform } from "react-native";
import FormData from 'form-data'

const IP_CONFIGURE_URL = "https://raw.githubusercontent.com/DucTrung1802/gcp_ip/main/gcp_ip.json"
const API_ROUTE = "/post_request"
const ENGLISH_KEYBOARD_NONEMPTY_REGEX = /^[ -~]+$/

export async function getIpConfigureUrl() {
    const response = await axios.get(IP_CONFIGURE_URL)
    return response.data.ip
}

function responseErrorHandler() {
    console.log("ERROR")
}

export async function postImageToServer(image, prompt) {
    var response

    // Validate backend IP
    response = await axios.get(IP_CONFIGURE_URL)
    if (!response || !response.data || !response.data.ip) {
        responseErrorHandler()
    }

    // Validate prompt
    if (!ENGLISH_KEYBOARD_NONEMPTY_REGEX.test(prompt)) {
        responseErrorHandler()
    }

    

    const backend_ip = String(response.data.ip)
    // Initialize FormData
    const formData = new FormData();

    // Get token
    const token = sha256(backend_ip)
    formData.append("token", token)

    formData.append("image", {
        uri: Platform.OS === 'android' ? image.uri : image.uri.replace('file://', ''),
        type: 'image/jpeg',
        name: 'image.jpg',
    })


    response = await axios.get(backend_ip)
    // console.log(response.data)
    response = await axios.post(backend_ip + API_ROUTE, formData, { headers: { "Content-Type": "multipart/form-data", }, })
    // console.log(response.data)
    return response
}