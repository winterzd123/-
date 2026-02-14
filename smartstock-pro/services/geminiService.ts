
import { GoogleGenAI, Type } from "@google/genai";
import { Product, Transaction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getInventoryInsights = async (products: Product[], transactions: Transaction[]) => {
  const context = `
    当前库存: ${JSON.stringify(products.map(p => ({ 名称: p.name, 库存: p.stock })))}
    最近交易: ${JSON.stringify(transactions.slice(-10).map(s => ({ 名称: s.productName, 数量: s.quantity, 日期: s.date })))}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `分析这些库存和销售数据。提供 3 条简短、可操作的商业建议，使用中文。${context}`,
    config: {
      temperature: 0.7,
      maxOutputTokens: 500,
    }
  });

  return response.text;
};

export const suggestProductCategory = async (productName: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `为名为 "${productName}" 的零售产品建议一个分类。仅返回中文分类名称。`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING }
        },
        required: ["category"]
      }
    }
  });

  try {
    const text = response.text;
    if (!text) return "通用";
    const data = JSON.parse(text.trim());
    return data.category;
  } catch {
    return "通用";
  }
};
