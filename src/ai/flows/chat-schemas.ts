
import { z } from "genkit";

/**
 * @fileoverview Defines the input and output schemas for the chat flow.
 *
 * - ChatInputSchema - The Zod schema for the chat function's input.
 * - ChatInput - The TypeScript type for the chat function's input.
 * - ChatOutputSchema - The Zod schema for the chat function's output.
 * - ChatOutput - The TypeScript type for the chat function's output.
 */

export const ChatInputSchema = z.object({
  persona: z.string().describe("The personality of the AI character."),
  history: z.array(z.any()).describe("The chat history."),
  prompt: z.string().describe("The user's latest message."),
  language: z.string().describe("The user's preferred default language."),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.object({
  response: z.string().describe("The AI's response."),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;
