
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Loader2, Send, Smile, Trash2 } from "lucide-react";

import { getCharacterById, type Character } from "@/lib/characters";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { chat } from "@/ai/flows/chat-flow";

type Message = {
  id: number;
  role: "user" | "model";
  text: string;
};

const MAX_RETRIES = 3;
const EMOJIS = [
  "😀", "😂", "❤️", "😍", "🤔", "👍", "🙏", "🎉", "👋", "😢", "😡", "😱",
  "😊", "🥰", "😭", "🥳", "😎", "🔥", "💯", "💔", "🙄", "😇", "🤝", "🙌",
];


function ChatInterface({ character }: { character: Character }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("english");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const storageKey = useMemo(() => `chatHistory_${character.id}`, [character.id]);

  useEffect(() => {
    try {
      const storedPrefs = localStorage.getItem("userPreferences");
      if (storedPrefs) {
        const prefs = JSON.parse(storedPrefs);
        if (prefs.language) {
          setLanguage(prefs.language);
        }
      }

      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        const { messages: storedMessages, timestamp } = JSON.parse(storedData);
        const isExpired = (Date.now() - timestamp) > 24 * 60 * 60 * 1000; // 24 hours
        
        if (!isExpired && Array.isArray(storedMessages)) {
          setMessages(storedMessages);
        } else {
          localStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      console.error("Failed to load data from localStorage:", error);
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    if (messages.length > 0) {
        try {
            const dataToStore = JSON.stringify({ messages, timestamp: Date.now() });
            localStorage.setItem(storageKey, dataToStore);
        } catch (error) {
            console.error("Failed to save chat history to localStorage:", error);
        }
    }
  }, [messages, storageKey]);


  useEffect(() => {
    // Scroll to the bottom of the chat container when new messages are added.
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleDeleteMessage = (id: number) => {
    setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== id));
  };


  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (trimmedInput === "" || !character || isLoading) return;

    setIsLoading(true);
    const userMessage: Message = { id: Date.now(), role: "user", text: trimmedInput };

    const newMessages: Message[] = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");

    // Prepare history for the AI, excluding the current message.
    const history = messages.map((msg) => ({
      role: msg.role,
      content: [{ text: msg.text }],
    }));

    let success = false;
    for (let retries = 0; retries < MAX_RETRIES && !success; retries++) {
      try {
        const result = await chat({
          persona: character.persona,
          history: history,
          prompt: trimmedInput,
          language: language,
        });

        if (result && typeof result.response === 'string' && result.response.trim() !== '') {
          const modelMessage: Message = { id: Date.now() + 1, role: "model", text: result.response };
          setMessages((prevMessages) => [...prevMessages, modelMessage]);
          success = true;
        } else {
          console.error("AI response was invalid or empty:", result);
        }

      } catch (error: any) {
        console.error(`AI chat failed (attempt ${retries + 1}):`, error);
        
        const isOverloaded = error?.message?.includes('503') || error?.message?.toLowerCase().includes('overloaded');

        if (isOverloaded && retries < MAX_RETRIES - 1) {
          const delay = Math.pow(2, retries) * 1000;
          console.log(`Service unavailable. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          let errorMessageText = "Oops! Something went wrong. Please try again.";
          if (isOverloaded) {
            errorMessageText = "The service is currently busy. Please try again in a moment.";
          }
          const errorMessage: Message = { id: Date.now() + 1, role: "model", text: errorMessageText };
          setMessages((prevMessages) => [...prevMessages, errorMessage]);
          break;
        }
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="flex items-center gap-4 border-b bg-background p-3 shadow-sm">
        <Link href={`/dashboard/${character.category}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <Avatar className="border-2 border-primary">
          <AvatarImage src={character.image.imageUrl} alt={character.name} />
          <AvatarFallback>{character.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
            <h1 className="text-lg font-bold text-foreground">{character.name}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5"><span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Online
            </p>
        </div>
      </header>
      <main
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-6"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`group flex items-start gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "model" && (
              <Avatar className="h-9 w-9 border">
                <AvatarImage
                  src={character.image.imageUrl}
                  alt={character.name}
                />
                <AvatarFallback>{character.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
             {message.role === "user" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Message?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this message? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteMessage(message.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            <div
              className={`max-w-md rounded-2xl p-3 px-4 text-base shadow-sm ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-background text-foreground rounded-bl-none border"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3 justify-start">
            <Avatar className="h-9 w-9 border">
              <AvatarImage
                src={character.image.imageUrl}
                alt={character.name}
              />
              <AvatarFallback>{character.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="max-w-xs rounded-2xl p-3 px-4 text-sm md:max-w-md lg:max-w-lg bg-background rounded-bl-none shadow-sm border">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          </div>
        )}
      </main>
      <footer className="border-t bg-background p-4">
        <div className="relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend()}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 pr-24 h-12 text-base rounded-full bg-gray-100"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-12 top-1/2 -translate-y-1/2 rounded-full h-9 w-9 text-muted-foreground"
              >
                <Smile className="h-5 w-5" />
                <span className="sr-only">Add Emoji</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2 border-none shadow-lg bg-background/80 backdrop-blur-sm mb-2">
              <div className="grid grid-cols-6 gap-2">
                {EMOJIS.map((emoji) => (
                  <span
                    key={emoji}
                    className="cursor-pointer text-2xl p-1 rounded-md hover:bg-accent transition-colors"
                    onClick={() => setInput((prev) => prev + emoji)}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <Button
            onClick={handleSend}
            disabled={isLoading || input.trim() === ""}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-9 w-9"
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </footer>
    </div>
  );
}

export default function ChatPage() {
  const { characterId } = useParams();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const character: Character | undefined = useMemo(() => {
    if (typeof characterId === "string") {
      return getCharacterById(characterId);
    }
    return undefined;
  }, [characterId]);

  if (!isClient) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }
  
  if (!character) {
    notFound();
    return null;
  }

  return <ChatInterface character={character} />;
}
