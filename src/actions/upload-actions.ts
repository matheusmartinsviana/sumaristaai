"use server";

import { getDbConnection } from "@/lib/db";
import { generateSummaryFromGemini } from "@/lib/gemini";
import { fetchAndExtractText } from "@/lib/langchain";
import { generateSummaryFromOpenAI } from "@/lib/openai";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

interface pdfSummaryType {
  userId?: string;
  fileUrl: string;
  summary: string;
  title: string;
  fileName: string;
}

export async function generatePdfText(fileUrl: string) {
  if (!fileUrl) {
    return {
      success: false,
      error: "Não foi possível enviar o arquivo. Por favor, tente novamente.",
      data: null,
    };
  }
  try {
    const pdfText = await fetchAndExtractText(fileUrl);

    if (!pdfText) {
      return {
        success: false,
        error: "Falha ao buscar e extrair o texto do PDF.",
        data: null,
      };
    }

    return {
      success: true,
      message: "Texto do PDF gerado com sucesso!",
      data: {
        pdfText,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: "Não foi possível buscar e extrair o texto do PDF.",
      data: null,
    };
  }
}

export async function generatePdfSummary({
  pdfText,
  fileName,
}: {
  pdfText: string;
  fileName: string;
}) {
  try {
    let summary = null;

    // try {
    //   summary = await generateSummaryFromOpenAI(pdfText);
    // } catch (openAIError: any) {
    //   console.error("Erro ao tentar gerar sumário com OpenAI:", openAIError);
    // }

    // Se OpenAI falhou ou retornou null, tenta Gemini
    if (!summary) {
      console.warn("Gerando sumário com Gemini");
      try {
        summary = await generateSummaryFromGemini(pdfText);
      } catch (geminiError) {
        console.error("Erro ao gerar o sumário com Gemini:", geminiError);
        throw new Error(
          "Erro ao gerar o sumário com o Gemini.",
        );
      }
    }

    if (!summary) {
      return {
        success: false,
        error: "Falha ao gerar o sumário.",
        data: null,
      };
    }

    return {
      success: true,
      message: "Sumário gerado com sucesso!",
      data: {
        title: fileName,
        summary,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: "Falha ao gerar o sumário do PDF.",
      data: null,
    };
  }
}

async function savePdfSummary({
  userId,
  fileUrl,
  summary,
  title,
  fileName,
}: pdfSummaryType) {
  try {
    const sql = await getDbConnection();
    const [savedSummary] = await sql`
        INSERT INTO pdf_summaries (
            user_id,
            original_file_url,
            summary_text,
            title,
            file_name
        ) VALUES (
            ${userId},
            ${fileUrl},
            ${summary},
            ${title},
            ${fileName}
        ) RETURNING id, summary_text`;
    return savedSummary;
  } catch (error) {
    console.error("Erro ao salvar o sumário do PDF", error);
    throw error;
  }
}

export async function storePdfSummaryAction({
  fileUrl,
  summary,
  title,
  fileName,
}: pdfSummaryType) {
  let savedSummary: any;
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        message: "Usuário não autenticado.",
      };
    }
    savedSummary = await savePdfSummary({
      userId,
      fileUrl,
      summary,
      title,
      fileName,
    });
    if (!savedSummary) {
      return {
        success: false,
        message: "Erro ao salvar o sumário do PDF, por favor tente novamente.",
      };
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erro ao salvar o sumário do PDF.",
    };
  }

  // Revalidar o cache
  revalidatePath(`/summaries/${savedSummary.id}`);

  return {
    success: true,
    message: "Sumário salvo com sucesso!",
    data: {
      id: savedSummary.id,
    },
  };
}
