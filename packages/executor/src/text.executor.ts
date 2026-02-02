import { NodeExecutor } from "./types.js";

export const TextNodeExecutor: NodeExecutor = {
    async execute(nodeId, config, inputs, state) {
        return {
            ...state,
            nodeOutputs: {
                ...state.nodeOutputs,
                [nodeId]: {
                    text: config.text,
                },
            },
        };
    },
};
