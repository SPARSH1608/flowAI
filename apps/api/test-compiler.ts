

import { buildImageGenGraph } from "./src/ai/imageGen/graph";

async function testCompiler() {
    console.log(" Testing Internal LangGraph Compiler Pipeline\n");

    const graph = buildImageGenGraph();

    console.log("Test Case 1: Podcast Portrait");
    console.log("─".repeat(50));

    const result1 = await graph.invoke({
        userText: "High-authority podcast portrait with modern creator vibe",
    });

    console.log("\n Intent:");
    console.log(JSON.stringify(result1.intent, null, 2));

    console.log("\n Visual Plan:");
    console.log(JSON.stringify(result1.visualPlan, null, 2));

    console.log("\n Constraints:");
    console.log(result1.constraints);

    console.log("\n Final Prompt:");
    console.log(result1.finalPrompt);
    console.log("\n" + "─".repeat(50) + "\n");

    console.log("Test Case 2: Product Shot");
    console.log("─".repeat(50));

    const result2 = await graph.invoke({
        userText: "Premium product photography for luxury watch",
        inlinePrompt: "dramatic lighting, black background",
    });

    console.log("\n Intent:");
    console.log(JSON.stringify(result2.intent, null, 2));

    console.log("\n Visual Plan:");
    console.log(JSON.stringify(result2.visualPlan, null, 2));

    console.log("\n Final Prompt:");
    console.log(result2.finalPrompt);
    console.log("\n" + "─".repeat(50) + "\n");

    console.log("Test Case 3: Stability Check");
    console.log("─".repeat(50));

    const result3a = await graph.invoke({
        userText: "Professional headshot for LinkedIn",
    });

    const result3b = await graph.invoke({
        userText: "Professional headshot for LinkedIn",
    });

    console.log("\n First run intent:", result3a.intent?.subject);
    console.log(" Second run intent:", result3b.intent?.subject);
    console.log("\n First run prompt length:", result3a.finalPrompt?.length);
    console.log(" Second run prompt length:", result3b.finalPrompt?.length);

    const structureMatch =
        result3a.intent?.subject === result3b.intent?.subject &&
        result3a.visualPlan?.camera === result3b.visualPlan?.camera;

    console.log("\n" + (structureMatch ? " STABLE" : " UNSTABLE") + " - Structure is consistent");
    console.log("\n" + "─".repeat(50) + "\n");

    console.log(" Compiler pipeline test complete!");
}

testCompiler().catch(console.error);
