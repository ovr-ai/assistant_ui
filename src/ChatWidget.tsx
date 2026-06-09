import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useLangGraphRuntime, unstable_createLangGraphStream } from "@assistant-ui/react-langgraph";
import { Client } from "@langchain/langgraph-sdk";
import { AssistantModal } from "@/components/assistant-ui/assistant-modal";

const client = new Client({
  apiUrl: import.meta.env.VITE_DEPLOYMENT_URL,
  apiKey: import.meta.env.VITE_API_KEY,
});

const stream = unstable_createLangGraphStream({
  client,
  assistantId: import.meta.env.VITE_LANGGRAPH_GRAPH_ID,
});

export function ChatWidget() {
  const runtime = useLangGraphRuntime({
    stream,
    create: async () => {
      const thread = await client.threads.create();
      return { externalId: thread.thread_id };
    },
    load: async (threadId) => {
      const state = await client.threads.getState(threadId);
      return { messages: (state.values as { messages?: unknown[] })?.messages ?? [] };
    },
  });
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AssistantModal />
    </AssistantRuntimeProvider>
  );
}
