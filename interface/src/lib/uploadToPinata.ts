import { PinataSDK } from "pinata";

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL;

const pinata = new PinataSDK({
  pinataJwt: PINATA_JWT,
  pinataGateway: GATEWAY_URL,
});

export const uploadToPinata = async (file: Blob): Promise<string | null> => {
  try {
    const file = new File([blob], "nft-image.png", {
      type: blob.type || "image/png",
      lastModified: Date.now(),
    });

    const result = await pinata.upload.public.file(file);
    const cid = result.data?.cid;

    if (!cid) {
      console.error("Missing CID in upload result");
      return null;
    }

    return `${GATEWAY_URL}/ipfs/${cid}`;
  } catch (err) {
    console.error("Pinata error", err);
    return null;
  }
};
