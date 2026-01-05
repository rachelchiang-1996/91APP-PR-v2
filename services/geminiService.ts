
import { GoogleGenAI, Type } from "@google/genai";
import { AIExtractionResponse, AuthMethod, RelationshipType, ContentType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseEmailContent = async (emailText: string): Promise<AIExtractionResponse> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        Analyze the following email content regarding a 91APP trademark or content licensing request.
        Extract the relevant information into a structured JSON.
        
        Current Date for context: ${today}
        
        Fields to extract:
        1. brand: The name of the brand requesting/involved.
        2. relationship: Infer if they are a '客戶' (Client), '合作夥伴' (Partner), '公協會' (Association), or '廠商' (Vendor). Default to '合作夥伴' if unsure.
        3. contentType: '商標' (Trademark/Logo) or '影音' (Video/Audio).
        4. usage: The purpose of usage (e.g., Press Release, Ad, Event, Case Study).
        5. location: Where it will be shown (Website, FB, Physical event, etc.).
        6. emailSubject: The subject line.
        7. authMethod: '簽署授權協議' (Signed Agreement) or '信件書面同意' (Email Consent).
        8. expiryDate: YYYY-MM-DD.
        9. applicant: Person name.
        10. applicationDate: YYYY-MM-DD.

        Rules:
        - If 'relationship' is not clear, guess based on context.
        - If 'contentType' is about Logo/Icon -> '商標'. If about Video/Footage -> '影音'.
        - If no expiry mentioned, estimate 1 year from now.

        Email Content:
        """
        ${emailText}
        """
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            brand: { type: Type.STRING },
            relationship: { type: Type.STRING, enum: [RelationshipType.CLIENT, RelationshipType.PARTNER, RelationshipType.ASSOCIATION, RelationshipType.VENDOR] },
            contentType: { type: Type.STRING, enum: [ContentType.TRADEMARK, ContentType.VIDEO_AUDIO] },
            usage: { type: Type.STRING },
            location: { type: Type.STRING },
            emailSubject: { type: Type.STRING },
            authMethod: { 
              type: Type.STRING, 
              enum: [AuthMethod.SIGNED_AGREEMENT, AuthMethod.EMAIL_CONSENT] 
            },
            expiryDate: { type: Type.STRING },
            applicant: { type: Type.STRING },
            applicationDate: { type: Type.STRING },
            remarks: { type: Type.STRING },
          },
        },
      },
    });

    const text = response.text;
    if (!text) return {};
    return JSON.parse(text) as AIExtractionResponse;
  } catch (error) {
    console.error("Error parsing email with Gemini:", error);
    throw new Error("Failed to parse email content");
  }
};
