import { createContext, useContext, useRef, useState } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useLangGraphRuntime, unstable_createLangGraphStream } from "@assistant-ui/react-langgraph";
import { Client } from "@langchain/langgraph-sdk";
import { AssistantModal } from "@/components/assistant-ui/assistant-modal";

const client = new Client({
  apiUrl: import.meta.env.VITE_DEPLOYMENT_URL,
});

const stream = unstable_createLangGraphStream({
  client,
  assistantId: import.meta.env.VITE_LANGGRAPH_GRAPH_ID,
});

export const RestartContext = createContext<() => void>(() => {});
export const useRestart = () => useContext(RestartContext);

function ChatWidgetInner({ defaultOpen }: { defaultOpen: boolean }) {
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
      <AssistantModal defaultOpen={defaultOpen} />
    </AssistantRuntimeProvider>
  );
}

export function ChatWidget() {
  const [key, setKey] = useState(0);
  const reopenRef = useRef(false);

  const restart = () => {
    reopenRef.current = true;
    setKey((k) => k + 1);
  };

  const defaultOpen = reopenRef.current;
  reopenRef.current = false;

  return (
    <RestartContext.Provider value={restart}>
      <ChatWidgetInner key={key} defaultOpen={defaultOpen} />
    </RestartContext.Provider>
  );
}
