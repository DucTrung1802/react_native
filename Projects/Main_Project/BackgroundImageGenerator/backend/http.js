import axios from "axios";
import { sha256 } from 'js-sha256'
import { Platform } from "react-native";
import FormData from 'form-data'
global.Buffer = require('buffer').Buffer;

// const IP_CONFIGURE_URL = process.env.IP_CONFIGURE_URL
const IP_CONFIGURE_URL = "https://raw.githubusercontent.com/DucTrung1802/gcp_ip/main/gcp_ip.json"
const API_ROUTE = "/post_request"
const ENGLISH_KEYBOARD_NONEMPTY_REGEX = /^[ -~]+$/

export async function getIpConfigureUrl() {
    const response = await axios.get(IP_CONFIGURE_URL)
    return response.data.ip
}

function responseErrorHandler() {
    console.log("http.js ERROR")
}

function base64ToBlob(base64String, contentType) {
    contentType = contentType || '';
    const byteCharacters = Buffer.from(base64String, 'base64');
    return new Blob([byteCharacters], { type: contentType });
}

export async function postImageToServer(image, prompt, nagativePrompt, cancelTokenSource) {
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

    if (!image.uri && !image.imageBytes) {
        responseErrorHandler()
    }

    // Initialize FormData
    const formData = new FormData();

    const backend_ip = String(response.data.ip)

    // Get token
    console.log(`http.js : 51 : start forming payload : ${Date().toLocaleString()}`)
    const token = sha256(backend_ip)
    formData.append("token", token)
    formData.append("prompt", prompt.trim())
    formData.append("negative_prompt", nagativePrompt.trim())

    const extension = "png";
    const imgType = extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg';
    const imgName = "input_image_" + String(Date.now()) + "." + extension

    formData.append("img_file", {
        uri: Platform.OS === 'android' ? image.uri : image.uri.replace('file://', ''),
        type: imgType,
        name: imgName,
    })

    console.log(`http.js : 73 : finish forming payload : ${Date().toLocaleString()}`)

    try {
        console.log(`http.js : 76 : start sending request : ${Date().toLocaleString()}`)
        response = await axios.post(backend_ip + API_ROUTE, formData,
            {
                headers: { "Content-Type": "multipart/form-data", },
                cancelToken: cancelTokenSource.token
            })
        console.log(`http.js : 82 : finish sending request : ${Date().toLocaleString()}`)
        return response
    } catch (error) {
        if (axios.isCancel(error)) {
            console.log('Request canceled:', error.message);
            return { "cancel": true }
        }
    }
}