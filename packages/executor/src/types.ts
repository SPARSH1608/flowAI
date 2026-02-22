import { ExecutionState } from "@repo/schema";

export interface NodeExecutor {
    execute(
        nodeId: string,
        config: any,
        inputs: Record<string, any>,
        state: ExecutionState
    ): Promise<ExecutionState>;
}
