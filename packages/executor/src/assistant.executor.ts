import { NodeExecutor } from "./types.js";

export const AssistantExecutor: NodeExecutor = {
    async execute(nodeId, config, inputs, state) {
        console.log(`[AssistantExecutor] Executing node ${nodeId}`);

        const userInput = inputs.text || "";
        const instructions = config.instructions || "Enhance this ad prompt to be more professional and detailed for an AI image generator. Output ONLY the enhanced prompt string.";

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.warn("OPENAI_API_KEY is not set. Falling back to simple passthrough.");
            return {
                nodeOutputs: {
                    [nodeId]: { text: userInput }
                },
                errors: [{ nodeId, error: "OPENAI_API_KEY not found" }]
            };
        }

        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        { role: "system", content: "You are a professional advertising prompt engineer. You enhance simple ad ideas into high-quality, descriptive prompts for AI image generators (like Stable Diffusion or Flux). Focus on lighting, composition, mood, and brand tone. Output ONLY the resulting prompt." },
                        { role: "user", content: `Context Instructions: ${instructions}\n\nUser Idea: ${userInput}` }
                    ],
                    max_tokens: 500
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error?.message || "OpenAI API error");
            }

            const enhancedPrompt = data.choices[0].message.content.trim();

            return {
                nodeOutputs: {
                    [nodeId]: { text: enhancedPrompt }
                },
                errors: []
            };
        } catch (error: any) {
            console.error("[AssistantExecutor] Enhancement failed:", error);
            return {
                nodeOutputs: {
                    [nodeId]: { text: userInput } // Fallback
                },
                errors: [{ nodeId, error: `OpenAI Error: ${error.message}` }]
            };
        }
    }
};
