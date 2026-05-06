import ImageKit from "@imagekit/nodejs";

/**
 * ImageKit Configuration
 * Initializes the ImageKit client used for uploading and managing images
 * generated or published by the application.
 */
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export default imagekit;
