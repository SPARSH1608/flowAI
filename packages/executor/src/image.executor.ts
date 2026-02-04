import { NodeExecutor } from "./types.js";

export const ImageNodeExecutor: NodeExecutor = {
    async execute(nodeId, config, inputs, state) {
        return {
            nodeOutputs: {
                [nodeId]: {
                    image: config.url || config.imageId,
                    imageId: config.imageId,
                    url: config.url,
                    purpose: config.purpose,
                },
            },
            errors: [],
        };
    },
};
