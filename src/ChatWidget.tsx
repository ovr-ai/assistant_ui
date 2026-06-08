import { useLocalRuntime, AssistantRuntimeProvider, type ChatModelAdapter } from "@assistant-ui/react";
import { AssistantModal } from "@/components/assistant-ui/assistant-modal";

const mockAdapter: ChatModelAdapter = {
  async *run({ messages, abortSignal }) {
    await new Promise((r) => setTimeout(r, 400));
    if (abortSignal.aborted) return;
    const last = messages.at(-1);
    const userText = last?.content
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("") ?? "";
    yield { content: [{ type: "text", text: `You said: "${userText}". (Mock — LangGraph not connected yet.)` }] };
  },
};

export function ChatWidget() {
  const runtime = useLocalRuntime(mockAdapter);
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AssistantModal />
    </AssistantRuntimeProvider>
  );
}
