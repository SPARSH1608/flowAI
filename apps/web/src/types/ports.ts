export type PortDataType =
    | "text"
    | "image"
    | "image[]"
    | "prompt"
    | "video"
    | "audio";

export const PORT_CONNECTIONS: Record<PortDataType, PortDataType[]> = {
    text: ["text", "prompt"],
    image: ["image", "image[]"],
    "image[]": ["image[]", "image"],
    prompt: ["prompt"],
    video: ["video"],
    audio: ["audio"],
};
