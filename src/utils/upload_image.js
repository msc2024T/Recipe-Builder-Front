import http_service from "./http_service";

/**
 * Uploads an image file to the server after validating its size and extension.
 * @param {File} file - The image file to upload.
 * @returns {Promise<Object>} - The response from the server.
 * @throws {Error} - Throws an error if validation fails or the upload fails.
 */
export async function uploadImage(file) {
  // Validate file size (max 5MB)
  const MAX_SIZE_MB = 5;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`Image must be less than ${MAX_SIZE_MB}MB`);
  }

  // Validate file type
  const validTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  if (!validTypes.includes(file.type)) {
    throw new Error("Please select a valid image file (JPG, PNG, GIF, WebP)");
  }

  // Prepare FormData for upload
  const formData = new FormData();
  formData.append("image", file);

  try {
    // Upload the image using the API
    const response = await http_service.post("/images/upload/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image. Please try again.");
  }
}
