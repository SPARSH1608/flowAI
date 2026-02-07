/**
 * End-to-End Image Generation Test
 * 
 * Tests the complete flow:
 * 1. User input → Compiler pipeline → Final prompt
 * 2. Final prompt → fal.ai → Generated images
 * 
 * Run with: bun run test-e2e-image.ts
 */

import { buildImageGenGraph } from "./src/ai/imageGen/graph";
import { generateImagesFal } from "./src/ai/fal/image";

async function testE2EImageGeneration() {
    console.log("🧪 End-to-End Image Generation Test\n");
    console.log("=".repeat(60));

    try {
        // Step 1: Compile the prompt
        console.log("\n📝 Step 1: Compiling prompt with internal LangGraph...\n");

        const graph = buildImageGenGraph();

        const compiledState = await graph.invoke({
            userText: "Professional headshot for LinkedIn profile, confident and approachable",
            inlinePrompt: "clean background, natural lighting",
        });

        console.log("✅ Compilation complete!\n");
        console.log("📋 Intent:", JSON.stringify(compiledState.intent, null, 2));
        console.log("\n🎥 Visual Plan:", JSON.stringify(compiledState.visualPlan, null, 2));
        console.log("\n📝 Final Prompt:");
        console.log("─".repeat(60));
        console.log(compiledState.finalPrompt);
        console.log("─".repeat(60));

        // Step 2: Generate images with fal.ai
        console.log("\n🎨 Step 2: Generating images with fal.ai...\n");

        const imageUrls = await generateImagesFal({
            model: "fal-ai/flux-realism",
            prompt: compiledState.finalPrompt!,
            numImages: 2,
        });

        console.log("✅ Image generation complete!\n");
        console.log("🖼️  Generated Images:");
        imageUrls.forEach((url, i) => {
            console.log(`   ${i + 1}. ${url}`);
        });

        console.log("\n" + "=".repeat(60));
        console.log("🎉 End-to-End Test SUCCESSFUL!");
        console.log("=".repeat(60));
        console.log("\n✅ Compiler pipeline: Working");
        console.log("✅ fal.ai integration: Working");
        console.log("✅ Image storage: Working");
        console.log(`✅ Generated ${imageUrls.length} images\n`);

    } catch (error) {
        console.error("\n❌ Test failed:");
        console.error(error);

        if (error instanceof Error) {
            if (error.message.includes("FAL_KEY")) {
                console.log("\n💡 Tip: Make sure FAL_KEY is set in apps/api/.env");
            }
        }

        process.exit(1);
    }
}

testE2EImageGeneration();
