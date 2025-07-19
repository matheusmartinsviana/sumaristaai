import { SUMMARY_SYSTEM_PROMPT } from "@/utils/prompts";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const generateSummaryFromGemini = async (pdfText: string) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      // generationConfig: {
      //   temperature: 0.7,
      //   maxOutputTokens: 1500,
      // },
    });

    const prompt = {
      contents: [
        {
          role: "user",
          parts: [
            { text: SUMMARY_SYSTEM_PROMPT },
            {
              text: `Transform this document into an engaging, easy-to-read 
              summary with contextually relevant emojis and proper markdown formatting:\n\n${pdfText}`,
            },
          ],
        },
      ],
    };

    const result = await model.generateContent(prompt);
    const response = await result.response;

    const output = response.text();
    if (!output) {
      throw new Error("Gemini API: Gemini retornou um texto vazio");
    }

    return output;
  } catch (error: any) {
    console.error("Gemini API Error:", error);

    const errorMessage = error?.message?.toLowerCase() || "";

    if (
      errorMessage.includes("rate limit") ||
      errorMessage.includes("quota") ||
      errorMessage.includes("exceeded")
    ) {
      throw new Error(
        "Servidor está sobrecarregado. Aguarde um minuto e tente novamente.",
      );
    }

    throw new Error(
      "Ocorreu um erro ao gerar o resumo. Tente novamente mais tarde.",
    );
  }
};
