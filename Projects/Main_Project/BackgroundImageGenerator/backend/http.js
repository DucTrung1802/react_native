import axios from "axios";

const IP_CONFIGURE_URL = "https://raw.githubusercontent.com/DucTrung1802/gcp_ip/main/gcp_ip.json"

export async function getIpConfigureUrl() {
    const response = await axios.get(IP_CONFIGURE_URL)
    return response.data.ip
}

export async function postImageToServer(image) {
    let backend_ip = await axios.get(IP_CONFIGURE_URL)
    const response = await axios.post(backend_ip + "/post_image", image)
    return response
}