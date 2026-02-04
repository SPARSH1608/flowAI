import { NodeExecutor } from "./types.js";

export const PassThroughExecutor: NodeExecutor = {
    async execute(nodeId, config, inputs, state) {
        return {
            ...state,
            nodeOutputs: {
                ...state.nodeOutputs,
                [nodeId]: inputs,
            },
        };
    },
};
