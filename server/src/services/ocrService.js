import Tesseract from "tesseract.js";

export async function extractTextFromImage(file) {
  if (!file?.buffer) {
    return "";
  }

  try {
    const {
      data: { text },
    } = await Tesseract.recognize(file.buffer, "eng", {
      logger: () => {},
    });

    return text.trim();
  } catch (error) {
    console.warn("OCR failed, continuing without OCR text.");
    console.warn(error.message);
    return "";
  }
}
