// import { PinataSDK } from "pinata";
import { nanoid } from "nanoid";

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL;

// const pinata = new PinataSDK({
//   pinataJwt: PINATA_JWT,
//   pinataGateway: GATEWAY_URL,
// });

export const uploadToPinata = async (blob: Blob): Promise<string | null> => {
  try {
    const randomName = nanoid();
    const file = new File([blob], `${randomName}.jpg`);

    const data = new FormData();
    data.append("file", file);
    data.append("network", "public");

    const request = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        body: data,
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
      }
    );

    if (!request.ok) {
      throw new Error(
        `Upload failed: ${request.status} - ${request.statusText}`
      );
    }

    const responseJson = await request.json();
    console.log("Upload thành công:", responseJson);

    const ipfsHash = responseJson.IpfsHash;
    return `${GATEWAY_URL}/ipfs/${ipfsHash}`;
  } catch (error) {
    console.error("Lỗi upload từ blob URL:", error);
    return null;
  }
};
