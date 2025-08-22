import { toastError } from "./utils";

const IMAGINE_API_KEY = import.meta.env.VITE_IMAGINE_API_KEY;

const createPrediction = async (
  prompt: string,
  style: string,
  aspectRatio?: string,
  seed?: number
): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("style", style);
    formData.append("aspect_ratio", aspectRatio!.toString());
    formData.append("seed", seed!.toString());

    const response = await fetch("https://api.vyro.ai/v2/image/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${IMAGINE_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      return null;
    }

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("image/")) {
      const blob = await response.blob();
      const imageURL = URL.createObjectURL(blob);
      return imageURL;
    }

    if (contentType.includes("image/")) {
      const blob = await response.blob();
      const imageURL = URL.createObjectURL(blob);
      return imageURL;
    }

    console.error("Unexpected content-type from API:", contentType);
    return null;
  } catch (err) {
    console.error("AI error:", err);
    toastError("AI is sleeping... Try again later!");
    return null;
  }
};

export default createPrediction;
