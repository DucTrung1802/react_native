import { createContext, useState } from 'react';
import { MAX_IMAGE_STORE } from '../constants/allConstants';

export const ImageContext = createContext({
    disableClipboardButton: true,
    imageInClipboard: null,
    mainImage: {
        uri: null,
        isGenerated: false,
        height: 0,
        width: 0,
    },
    imageList: [],
    cancelToken: null,
    setDisableClipboardButton: (value) => { },
    setImageInClipboard: (imageInClipboard) => { },
    setMainImage: (image) => { },
    setMainImageAndAdd: async (image) => { },
    setCancelToken: async (source) => { },
});

function ContextProvider({ children }) {
    const [currentDisableClipboardButton, setCurrentDisableClipboardButton] = useState(true)
    const [currentImageInClipboard, setCurrentImageInClipboard] = useState(null)
    const [currentMainImage, setCurrentMainImage] = useState({})
    const [currentImageList, setCurrentImageList] = useState([])
    const [currentCancelToken, setCurrentCancelToken] = useState(null);

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

    function setCancelToken(source) {
        setCurrentCancelToken(source)
    }

    const value = {
        disableClipboardButton: currentDisableClipboardButton,
        imageInClipboard: currentImageInClipboard,
        mainImage: currentMainImage,
        imageList: currentImageList,
        cancelToken: currentCancelToken,
        setDisableClipboardButton: setDisableClipboardButton,
        setImageInClipboard: setImageInClipboard,
        setMainImage: setMainCurrentImage,
        setMainImageAndAdd: setMainCurrentImageAndAddToList,
        setCancelToken: setCancelToken
    }

    return (
        <ImageContext.Provider value={value}>
            {children}
        </ImageContext.Provider>
    )
}

export default ContextProvider