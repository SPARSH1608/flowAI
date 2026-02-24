"use client";

import { useState, useEffect } from "react";
import { fetchImages, normalizeUrl } from "@/utils/images";
import { Images } from "lucide-react";

interface Image {
    id: string;
    filename: string;
    url: string;
    mimetype: string;
    size: number;
    purpose: string | null;
    createdAt: string;
}

interface MediaLibraryProps {
    onImageSelect: (imageData: { imageId: string; url: string; purpose: string }) => void;
}

export default function MediaLibrary({ onImageSelect }: MediaLibraryProps) {
    const [images, setImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadImages();
    }, []);

    async function loadImages() {
        setLoading(true);
        try {
            const data = await fetchImages();
            setImages(data);
        } catch (err) {
            console.error("Failed to load images:", err);
        } finally {
            setLoading(false);
        }
    }

    function handleImageClick(image: Image) {
        onImageSelect({
            imageId: image.id,
            url: image.url,
            purpose: image.purpose || "identity",
        });
    }

    function handleDragStart(e: React.DragEvent, image: Image) {
        e.dataTransfer.setData(
            "application/xyflow",
            JSON.stringify({
                type: "IMAGE_NODE",
                imageData: {
                    imageId: image.id,
                    url: image.url,
                    purpose: image.purpose || "identity",
                },
            })
        );
        e.dataTransfer.effectAllowed = "copy";
    }

    return (
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide">
            {loading ? (
                <div className="flex items-center justify-center h-32 text-neutral-500 text-sm">
                    Loading...
                </div>
            ) : images.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-neutral-500 text-sm text-center">
                    <Images size={32} className="mb-2 opacity-50" />
                    <p>No images uploaded yet</p>
                    <p className="text-xs mt-1">Upload images via ImageNode</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    {images.map((image) => (
                        <button
                            key={image.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, image)}
                            onClick={() => handleImageClick(image)}
                            className="group relative aspect-square cursor-pointer rounded-lg overflow-hidden border border-neutral-800 hover:border-blue-500 transition-all hover:scale-105"
                        >
                            <img
                                src={normalizeUrl(process.env.NEXT_PUBLIC_API_URL, image.url)}
                                alt={image.filename}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-medium text-center px-2">
                                    Click or drag
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            <button
                onClick={loadImages}
                className="w-full mt-4 py-2 px-4 bg-neutral-800 hover:bg-neutral-700 text-white text-sm rounded-lg transition-colors"
            >
                Refresh
            </button>
        </div>
    );
}
