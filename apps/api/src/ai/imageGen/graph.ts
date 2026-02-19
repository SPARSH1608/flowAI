

import { StateGraph, Annotation } from "@langchain/langgraph";
import type { ImageGenState, AdType, ReferenceImageAnalysis, AdCreativePlan } from "./state";
import { intentNode } from "./intent.node";
import { visualNode } from "./visual.node";
import { adCreativeNode } from "./adCreative.node";
import { constraintsNode } from "./constraints.node";
import { compilerNode } from "./compiler.node";

const ImageGenStateAnnotation = Annotation.Root({
    userText: Annotation<string | undefined>,
    inlinePrompt: Annotation<string | undefined>,
    referenceImages: Annotation<
        { id: string; url: string; purpose?: string }[] | undefined
    >,
    referenceImageAnalysis: Annotation<ReferenceImageAnalysis | undefined>,
    intent: Annotation<{
        subject: string;
        scenario?: string;
        mood?: string;
        brandTone?: string;
        artStyle?: string;
        lighting?: string;
        composition?: string;
        audience?: string;
        headline?: string;
        primaryText?: string;
        ctaText?: string;
        designElements?: string[];
        adType: AdType;
        adFormat?: string;
    } | undefined>,
    visualPlan: Annotation<{
        camera: string;
        framing: string;
        lighting: string;
        environment: string;
        realismLevel: "strict" | "balanced";
    } | undefined>,
    adCreativePlan: Annotation<AdCreativePlan | undefined>,
    constraints: Annotation<string[] | undefined>,
    finalPrompt: Annotation<string | undefined>,
});

export function buildImageGenGraph() {
    const graph = new StateGraph(ImageGenStateAnnotation)
        .addNode("extractIntent", intentNode)
        .addNode("planVisuals", visualNode)
        .addNode("adCreative", adCreativeNode)
        .addNode("addConstraints", constraintsNode)
        .addNode("compilePrompt", compilerNode)
        .addEdge("__start__", "extractIntent")
        .addEdge("extractIntent", "planVisuals")
        .addEdge("planVisuals", "adCreative")
        .addEdge("adCreative", "addConstraints")
        .addEdge("addConstraints", "compilePrompt")
        .addEdge("compilePrompt", "__end__");

    return graph.compile();
}
