
export interface ImageGenState {
    userText?: string;
    inlinePrompt?: string;

    referenceImages?: {
        id: string;
        url: string;
        purpose?: string;
    }[];

    intent?: {
        subject: string;
        scenario?: string;
        mood?: string;
        brandTone?: string;
        artStyle?: string;
        lighting?: string;
        composition?: string;
        audience?: string;
    };

    visualPlan?: {
        camera: string;
        framing: string;
        lighting: string;
        environment: string;
        realismLevel: "strict" | "balanced";
    };

    constraints?: string[];

    finalPrompt?: string;
}
