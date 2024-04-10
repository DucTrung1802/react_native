import axios from "axios";
import { sha256 } from 'js-sha256'
import { Platform } from "react-native";

const IP_CONFIGURE_URL = "https://raw.githubusercontent.com/DucTrung1802/gcp_ip/main/gcp_ip.json"
const API_ROUTE = "/upload_image"

export async function getIpConfigureUrl() {
    const response = await axios.get(IP_CONFIGURE_URL)
    return response.data.ip
}

// export async function postImageToServer(image) {
//     var formData = new FormData()
//     formData.append('img_file', {
//         uri: Platform.OS === 'android' ? image.uri : image.uri.replace('file://', ''),
//         type: 'image/jpeg',
//         name: 'image.jpg',
//     });
//     var response = await axios.get(IP_CONFIGURE_URL)
//     backend_ip = response.data.ip
//     let backend_ip_hash = sha256(backend_ip)
//     // response = await axios.post(backend_ip + API_ROUTE, formData)
//     response = await axios.post(backend_ip + API_ROUTE, formData)
//     return response
// }

export async function postImageToServer(image) {
    console.log(image)
    var response = await axios.get(IP_CONFIGURE_URL)
    backend_ip = response.data.ip
    let backend_ip_hash = sha256(backend_ip)
    // response = await axios.post(backend_ip + API_ROUTE, formData)
    response = await axios.post(backend_ip + API_ROUTE, image)
    console.log("http.js -", response.data)
    return response
}