
export type AdType = "product-ad" | "lifestyle-ad" | "person-centric-ad";

export interface ReferenceImageAnalysis {
    type: "product" | "person" | "scene";
    description: string;
    brandDetails?: {
        brandName?: string;
        colors?: string[];
        logoDescription?: string;
        packagingStyle?: string;
    };
    personDetails?: {
        appearance: string;
        clothing: string;
        expression: string;
        distinctiveFeatures: string;
    };
}

export interface AdCreativePlan {
    layout: string;
    headline: string;
    tagline?: string;
    ctaText?: string;
    colorPalette: string[];
    typographyStyle: string;
    visualHierarchy: string;
    heroElement: string;
    textPlacement: string;
}

export interface ImageGenState {
    userText?: string;
    inlinePrompt?: string;

    referenceImages?: {
        id: string;
        url: string;
        purpose?: string;
    }[];

    referenceImageAnalysis?: ReferenceImageAnalysis;

    intent?: {
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
    };

    visualPlan?: {
        camera: string;
        framing: string;
        lighting: string;
        environment: string;
        realismLevel: "strict" | "balanced";
    };

    adCreativePlan?: AdCreativePlan;

    constraints?: string[];

    finalPrompt?: string;
}
