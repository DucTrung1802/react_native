import axios from "axios";
import { sha256 } from 'js-sha256'

const IP_CONFIGURE_URL = "https://raw.githubusercontent.com/DucTrung1802/gcp_ip/main/gcp_ip.json"

export async function getIpConfigureUrl() {
    const response = await axios.get(IP_CONFIGURE_URL)
    return response.data.ip
}

export async function postImageToServer(image) {
    var formData = new FormData()
    formData.append('img_file', {
        uri: Platform.OS === 'android' ? image.uri : image.uri.replace('file://', ''),
        type: 'image/jpeg',
        name: 'image.jpg',
    });
    let backend_ip = await axios.get(IP_CONFIGURE_URL)
    let backend_ip_hash = sha256(backend_ip)
    const response = await axios.post(backend_ip + "/post_image", formData)
    return response
}