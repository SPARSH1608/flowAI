

import { fal } from "../lib/fal";


export async function callLLM<T>({
    model,
    system,
    user,
}: {
    model: string;
    system: string;
    user: string;
}): Promise<T> {
    const result = await fal.subscribe(model, {
        input: {
            prompt: user,
            system_prompt: system + "\n\nIMPORTANT: Respond ONLY with valid JSON. No other text.",
            max_tokens: 1000,
        },
    });

    try {
        // Handle potential different response structures from fal-ai/any-llm
        // Sometimes it's result.data.output, sometimes result.output directly
        const data = result.data || result;
        let output = data.output || data.text || (typeof data === 'string' ? data : JSON.stringify(data));

        if (typeof output === 'string') {
            output = output.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            const jsonMatch = output.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                output = jsonMatch[0];
            }

            return JSON.parse(output);
        }

        return output as T;
    } catch (error) {
        console.error("LLM returned invalid JSON:", result);
        console.error("Parse error:", error);
        throw new Error("LLM returned invalid JSON");
    }
}
