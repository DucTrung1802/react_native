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
    outputImages: [
        {
            index: 0,
            uri: "",
            isGenerated: true,
        },
        {
            index: 1,
            uri: "",
            isGenerated: true,
        },
    ],
    imageList: [],
    cancelToken: null,
    setDisableClipboardButton: (value) => { },
    setImageInClipboard: (imageInClipboard) => { },
    setMainImage: (image) => { },
    setMainImageAndAdd: async (image) => { },
    setCancelToken: async (source) => { },
    addOutputImage: async (newOutputImage) => { }
});

function ContextProvider({ children }) {
    const [currentDisableClipboardButton, setCurrentDisableClipboardButton] = useState(true)
    const [currentImageInClipboard, setCurrentImageInClipboard] = useState(null)
    const [currentMainImage, setCurrentMainImage] = useState({})
    const [currentImageList, setCurrentImageList] = useState([])
    const [currentCancelToken, setCurrentCancelToken] = useState(null);
    const [currentOutputImages, setCurrentOutputImages] = useState([
        // {
        //     index: 0,
        //     uri: "https://2.img-dpreview.com/files/p/E~C1000x0S4000x4000T1200x1200~articles/3925134721/0266554465.jpeg",
        //     isGenerated: true,
        // },
        // {
        //     index: 1,
        //     uri: "https://fujifilm-x.com/wp-content/uploads/2021/01/gfx100s_sample_04_thum-1.jpg",
        //     isGenerated: true,
        // }
    ])

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

    function addOutputImage(newOutputImage) {
        setCurrentOutputImages((outputImages) => [...outputImages, newOutputImage])
    }

    const value = {
        disableClipboardButton: currentDisableClipboardButton,
        imageInClipboard: currentImageInClipboard,
        mainImage: currentMainImage,
        imageList: currentImageList,
        cancelToken: currentCancelToken,
        outputImages: currentOutputImages,
        setDisableClipboardButton: setDisableClipboardButton,
        setImageInClipboard: setImageInClipboard,
        setMainImage: setMainCurrentImage,
        setMainImageAndAdd: setMainCurrentImageAndAddToList,
        setCancelToken: setCancelToken,
        addOutputImage: addOutputImage
    }

    return (
        <ImageContext.Provider value={value}>
            {children}
        </ImageContext.Provider>
    )
}

export default ContextProvider