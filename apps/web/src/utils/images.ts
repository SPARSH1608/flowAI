export const normalizeUrl = (baseUrl: string | undefined, path: string) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
    if (!baseUrl) return path;
    const cleanBase = baseUrl.replace(/\/+$/, "");
    const cleanPath = path.replace(/^\/+/, "");
    return `${cleanBase}/${cleanPath}`;
};

export async function uploadImage(file: File, purpose: string) {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("purpose", purpose);

    const url = normalizeUrl(process.env.NEXT_PUBLIC_API_URL, "/images");
    const res = await fetch(url, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        throw new Error("Upload failed");
    }

    return res.json();
}

export async function fetchImages() {
    const url = normalizeUrl(process.env.NEXT_PUBLIC_API_URL, "/images");
    const res = await fetch(url);

    if (!res.ok) {
        throw new Error("Failed to fetch images");
    }

    return res.json();
}
