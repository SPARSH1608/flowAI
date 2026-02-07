

import { StateGraph, Annotation } from "@langchain/langgraph";
import type { ImageGenState } from "./state";
import { intentNode } from "./intent.node";
import { visualNode } from "./visual.node";
import { constraintsNode } from "./constraints.node";
import { compilerNode } from "./compiler.node";

const ImageGenStateAnnotation = Annotation.Root({
    userText: Annotation<string | undefined>,
    inlinePrompt: Annotation<string | undefined>,
    referenceImages: Annotation<
        { id: string; url: string; purpose?: string }[] | undefined
    >,
    intent: Annotation<{
        subject: string;
        scenario?: string;
        mood?: string;
        brandTone?: string;
        audience?: string;
    } | undefined>,
    visualPlan: Annotation<{
        camera: string;
        framing: string;
        lighting: string;
        environment: string;
        realismLevel: "strict" | "balanced";
    } | undefined>,
    constraints: Annotation<string[] | undefined>,
    finalPrompt: Annotation<string | undefined>,
});

export function buildImageGenGraph() {
    const graph = new StateGraph(ImageGenStateAnnotation)
        .addNode("extractIntent", intentNode)
        .addNode("planVisuals", visualNode)
        .addNode("addConstraints", constraintsNode)
        .addNode("compilePrompt", compilerNode)
        .addEdge("__start__", "extractIntent")
        .addEdge("extractIntent", "planVisuals")
        .addEdge("planVisuals", "addConstraints")
        .addEdge("addConstraints", "compilePrompt")
        .addEdge("compilePrompt", "__end__");

    return graph.compile();
}
