export async function uploadImage(file: File, purpose: string) {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("purpose", purpose);

    const res = await fetch("http://localhost:3002/images", {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        throw new Error("Upload failed");
    }

    return res.json();
}

export async function fetchImages() {
    const res = await fetch("http://localhost:3002/images");

    if (!res.ok) {
        throw new Error("Failed to fetch images");
    }

    return res.json();
}
