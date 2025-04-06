// @ts-ignore
// import { NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET } from "@env";
const NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "dkqzg1ouo";
const NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET = "unsigned_preset";
export const uploadToCloudinary = async (file: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        if (!response.ok) {
            throw new Error("Upload failed");
        }

        const result = await response.json();
        return result.secure_url;
    } catch (error) {
        console.error("Upload error:", error);
        throw error;
    }
};


export const deleteFromCloudinaryOld = async (publicId: string) => {
    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "");

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/destroy`, {
            method: "POST",
            body: formData,
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            }
        });

        if (!response.ok) {
            console.log(response);
            throw new Error('Deletion failed');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Cloudinary deletion error:', error);
        throw error;
    }
};

export const deleteFromCloudinary = async (publicId: string) => {
    try {
        const response = await fetch("http://localhost:3000/api/delete-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicId }),
        });
        console.log(response);
        if (!response.ok) {
            console.log("response", response);
            throw new Error("Deletion failed");
        }

        const result = await response.json()
        console.log("result", result);
        return result;
    } catch (error) {
        console.error("Cloudinary deletion error:", error);
        throw error;
    }
};


// Helper function to extract publicId from Cloudinary URL
export const extractPublicIdFromUrl = (url: string) => {
    const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
    return matches ? matches[1] : null;
};
