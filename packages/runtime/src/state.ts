import { ExecutionState } from "@repo/schema";
export { type ExecutionState };

export const initialState: ExecutionState = {
    nodeOutputs: {},
    errors: [],
};
