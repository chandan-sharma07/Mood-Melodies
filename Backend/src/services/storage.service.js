const ImageKit = require("@imagekit/nodejs").default;

let imageKit = null;

function getImageKit() {
    if (imageKit) return imageKit;

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) {
        throw new Error(
            "ImageKit is not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT in .env"
        );
    }

    imageKit = new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        privateKey,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });

    return imageKit;
}

async function uploadFile(file) {
    try {
        const response = await getImageKit().upload({
            file: file.buffer,
            fileName: file.originalname,
            folder: file.folder || "/",
        });
        return response.url;
    } catch (error) {
        console.error("Error uploading file to ImageKit:", error);
        throw error;
    }
}

module.exports = { getImageKit, uploadFile };
