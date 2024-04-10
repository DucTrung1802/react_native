import { createContext, useState } from 'react';
import { MAX_IMAGE_STORE } from '../constants/styles';

export const ImageContext = createContext({
    disableClipboardButton: true,
    imageInClipboard: null,
    mainImage: {
        uri: null,
        size: {
            height: 0,
            width: 0
        }
    },
    prompt: "",
    imageList: [],
    setDisableClipboardButton: (value) => { },
    setImageInClipboard: (imageInClipboard) => { },
    setMainImage: (image) => { },
    setMainImageAndAdd: async (image) => { },
});

function ContextProvider({ children }) {
    const [currentDisableClipboardButton, setCurrentDisableClipboardButton] = useState(true)
    const [currentImageInClipboard, setCurrentImageInClipboard] = useState(null)
    const [currentMainImage, setCurrentMainImage] = useState({})
    const [currentImageList, setCurrentImageList] = useState([])

    function setDisableClipboardButton(value) {
        setCurrentDisableClipboardButton(value)
    }

    function setImageInClipboard(imageInClipboard) {
        setCurrentImageInClipboard(imageInClipboard)
    }

    function setMainCurrentImage(newMainImage) {
        setCurrentMainImage(newMainImage)
    }

    function setMainCurrentImageAndAddToList(newMainImage) {
        if (currentImageList.length == MAX_IMAGE_STORE) {
            currentImageList.pop()
        }
        setCurrentMainImage(newMainImage)
        setCurrentImageList((imageList) => [newMainImage, ...imageList])
    }

    const value = {
        disableClipboardButton: currentDisableClipboardButton,
        imageInClipboard: currentImageInClipboard,
        mainImage: currentMainImage,
        imageList: currentImageList,
        setDisableClipboardButton: setDisableClipboardButton,
        setImageInClipboard: setImageInClipboard,
        setMainImage: setMainCurrentImage,
        setMainImageAndAdd: setMainCurrentImageAndAddToList
    }

    return (
        <ImageContext.Provider value={value}>
            {children}
        </ImageContext.Provider>
    )
}

export default ContextProvider