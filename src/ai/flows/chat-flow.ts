
"use server";
/**
 * @fileoverview A flow for generating chat responses from an AI character.
 *
 * - chat - A function that takes user input and character persona to generate a response.
 */

import { ai } from "@/ai/genkit";
import {
  type ChatInput,
  ChatInputSchema,
  type ChatOutput,
  ChatOutputSchema,
} from "@/ai/flows/chat-schemas";

const chatFlow = ai.defineFlow(
  {
    name: "chatFlow",
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const { persona, history, prompt } = input;

    const systemPrompt = `${persona}
    
    IMPORTANT: You must detect the language the user is speaking in their prompt (e.g., English, Hinglish, Hindi) and respond in the exact same language. Your entire response must be in that language, no exceptions.
    Your replies MUST be short, mature, specific, and directly relevant to the user's message.
    NEVER use overly poetic language, proverbs, or generic chatbot phrases. Be a real, believable human character.`;

    const llmResponse = await ai.generate({
      prompt: prompt,
      history: history,
      config: {
        temperature: 0.5,
      },
      system: systemPrompt,
    });

    return {
      response: llmResponse.text,
    };
  }
);

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}
