import { ExecutionState } from "@repo/runtime";

export interface NodeExecutor {
    execute(
        nodeId: string,
        config: any,
        inputs: Record<string, any>,
        state: ExecutionState
    ): Promise<ExecutionState>;
}
