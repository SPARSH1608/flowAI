export interface ExecutionState {
    // Outputs per node
    nodeOutputs: Record<
        string,
        Record<string, any> // portType → value
    >;

    // Errors
    errors: Array<{
        nodeId: string;
        error: string;
    }>;
}
