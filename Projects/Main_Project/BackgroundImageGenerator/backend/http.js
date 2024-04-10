import axios from "axios";
import { sha256 } from 'js-sha256'
import { Platform } from "react-native";
import FormData from 'form-data'

const IP_CONFIGURE_URL = "https://raw.githubusercontent.com/DucTrung1802/gcp_ip/main/gcp_ip.json"
const API_ROUTE = "/post_request"

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
    const formData = new FormData();
    formData.append("jwt", "1234")
    formData.append("image", "4567")
    var response = await axios.get(IP_CONFIGURE_URL)
    backend_ip = response.data.ip
    let backend_ip_hash = sha256(backend_ip)
    try {
        response = await axios.get(backend_ip)
        console.log(response.data)
        response = await axios.post(backend_ip + API_ROUTE, formData, { headers: { "Content-Type": "multipart/form-data", }, })
        console.log(response.data)
    }
    catch (ex) {
        console.log(ex)
    }
    return response
}