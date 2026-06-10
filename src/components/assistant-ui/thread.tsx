import { ComposerAttachments, UserMessageAttachments } from "@/components/assistant-ui/attachment";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import { Reasoning, ReasoningContent, ReasoningRoot, ReasoningText, ReasoningTrigger } from "@/components/assistant-ui/reasoning";
import { ToolGroupContent, ToolGroupRoot, ToolGroupTrigger } from "@/components/assistant-ui/tool-group";
import { ToolFallback } from "@/components/assistant-ui/tool-fallback";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ActionBarPrimitive,
  AssistantModalPrimitive,
  AuiIf,
  BranchPickerPrimitive,
  useThreadRuntime,
  ComposerPrimitive,
  ErrorPrimitive,
  groupPartByType,
  MessagePrimitive,
  ThreadPrimitive,
  useAuiState,
} from "@assistant-ui/react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  PencilIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  SquareIcon,
  XIcon,
} from "lucide-react";
import type { FC } from "react";

export const Thread: FC = () => {
  return (
    <ThreadPrimitive.Root
      className="aui-root aui-thread-root bg-background @container flex h-full flex-col"
      style={{
        ["--thread-max-width" as string]: "44rem",
        ["--composer-radius" as string]: "20px",
        ["--composer-padding" as string]: "10px",
      }}
    >
      <div className="flex shrink-0 items-center justify-between px-4 py-3" style={{ backgroundColor: "#111111" }}>
        <div className="flex items-center gap-3">
          <div className="size-9 flex-shrink-0 flex items-center justify-center rounded-full text-white text-sm font-bold" style={{ backgroundColor: "#E8427A" }}>
            P
          </div>
          <div>
            <div className="text-sm font-bold text-white">popeia</div>
            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "rgba(255,255,255,0.5)" }}>
              <span className="inline-block size-1.5 rounded-full" style={{ backgroundColor: "#4ADE80" }} />
              Online · antwortet sofort
            </div>
          </div>
        </div>
        <AssistantModalPrimitive.Trigger asChild>
          <TooltipIconButton tooltip="Chat schließen" variant="ghost" className="size-8 rounded-full" style={{ color: "rgba(255,255,255,0.5)" }}>
            <XIcon className="size-4" strokeWidth={2.5} />
          </TooltipIconButton>
        </AssistantModalPrimitive.Trigger>
      </div>
      <ThreadPrimitive.Viewport
        turnAnchor="top"
        data-slot="aui_thread-viewport"
        className="relative flex flex-1 flex-col overflow-x-auto overflow-y-scroll scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="mx-auto flex w-full max-w-(--thread-max-width) flex-1 flex-col px-4 pt-5">
          <AuiIf condition={(s) => s.thread.isEmpty}>
            <ThreadWelcome />
          </AuiIf>

          <div data-slot="aui_message-group" className="mb-10 flex flex-col gap-y-5 empty:hidden">
            <ThreadPrimitive.Messages>
              {() => <ThreadMessage />}
            </ThreadPrimitive.Messages>
          </div>

          <ThreadPrimitive.ViewportFooter className="aui-thread-viewport-footer bg-background sticky bottom-0 mt-auto flex flex-col gap-3 overflow-visible pb-4">
            <ThreadScrollToBottom />
            <Composer />
            <p className="text-center text-[11px] text-muted-foreground/50 px-2">
              KI kann Fehler machen. Wichtige Infos per Mail überprüfen.
            </p>
          </ThreadPrimitive.ViewportFooter>
        </div>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
};

const ThreadMessage: FC = () => {
  const role = useAuiState((s) => s.message.role);
  const isEditing = useAuiState((s) => s.message.composer.isEditing);
  if (isEditing) return <EditComposer />;
  if (role === "user") return <UserMessage />;
  return <AssistantMessage />;
};

const ThreadScrollToBottom: FC = () => (
  <ThreadPrimitive.ScrollToBottom asChild>
    <TooltipIconButton
      tooltip="Scroll to bottom"
      variant="outline"
      className="aui-thread-scroll-to-bottom absolute -top-12 z-10 self-center rounded-full border-border/60 bg-background p-4 shadow-md disabled:invisible"
    >
      <ArrowDownIcon />
    </TooltipIconButton>
  </ThreadPrimitive.ScrollToBottom>
);

const ThreadWelcome: FC = () => (
  <div className="aui-thread-welcome-root my-auto flex grow flex-col">
    <div className="flex w-full grow flex-col items-start justify-center">
      <div className="flex size-full flex-col justify-center px-4 gap-3">
        <div className="flex items-end gap-2">
          <div className="size-7 shrink-0 flex items-center justify-center rounded-full text-white text-[11px] font-bold" style={{ backgroundColor: "#E8427A" }}>
            P
          </div>
          <div
            className="text-sm leading-relaxed animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-300 max-w-[80%]"
            style={{ backgroundColor: "#F5F5F5", borderRadius: "16px 16px 16px 2px", padding: "10px 14px", color: "#111111" }}
          >
            Hey! Schön, dass du da bist. Womit kann ich dir helfen? 💜
          </div>
        </div>
        <QuickReplies />
      </div>
    </div>
  </div>
);

const QuickReplies: FC = () => {
  const thread = useThreadRuntime();
  const send = (text: string) => thread.append({ role: "user", content: [{ type: "text", text }] });
  return (
    <div className="flex flex-wrap gap-2 pl-9 animate-in fade-in fill-mode-both duration-300 delay-150">
      {["Größe finden 📏", "Meine Bestellung 📦", "Nachhaltigkeit ♻️"].map((label) => (
        <button
          key={label}
          type="button"
          onClick={() => send(label)}
          className="text-xs font-semibold px-3 py-1.5 bg-white border-2 transition-colors hover:bg-[#FDEEF4]"
          style={{ borderColor: "#E8427A", color: "#E8427A", borderRadius: "20px" }}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

const Composer: FC = () => (
  <ComposerPrimitive.Root className="aui-composer-root relative flex w-full flex-col">
    <ComposerPrimitive.AttachmentDropzone asChild>
      <div
        data-slot="aui_composer-shell"
        className="bg-secondary/30 focus-within:border-ring/60 focus-within:bg-background focus-within:ring-2 focus-within:ring-ring/20 data-[dragging=true]:border-ring data-[dragging=true]:bg-accent/50 flex w-full flex-col gap-2 rounded-(--composer-radius) border border-border/70 p-(--composer-padding) transition-all data-[dragging=true]:border-dashed"
      >
        <ComposerAttachments />
        <ComposerPrimitive.Input
          placeholder="Deine Frage an popeia…"
          className="aui-composer-input placeholder:text-muted-foreground/60 max-h-32 min-h-10 w-full resize-none bg-transparent px-1.75 py-1 text-sm outline-none"
          rows={1}
          autoFocus
          aria-label="Message input"
        />
        <ComposerAction />
      </div>
    </ComposerPrimitive.AttachmentDropzone>
  </ComposerPrimitive.Root>
);

const RestartChatButton: FC = () => {
  const thread = useThreadRuntime();
  return (
    <TooltipIconButton tooltip="Restart chat" variant="ghost" className="size-8 rounded-full" onClick={() => thread.reset()}>
      <RotateCcwIcon className="size-4" />
    </TooltipIconButton>
  );
};

const ComposerAction: FC = () => (
  <div className="aui-composer-action-wrapper relative flex items-center justify-between">
    <RestartChatButton />
    <AuiIf condition={(s) => !s.thread.isRunning}>
      <ComposerPrimitive.Send asChild>
        <TooltipIconButton
          tooltip="Send message"
          side="bottom"
          type="button"
          variant="default"
          size="icon"
          className="aui-composer-send size-8 rounded-full"
          aria-label="Send message"
        >
          <ArrowUpIcon className="aui-composer-send-icon size-4" />
        </TooltipIconButton>
      </ComposerPrimitive.Send>
    </AuiIf>
    <AuiIf condition={(s) => s.thread.isRunning}>
      <ComposerPrimitive.Cancel asChild>
        <Button type="button" variant="default" size="icon" className="aui-composer-cancel size-8 rounded-full" aria-label="Stop generating">
          <SquareIcon className="aui-composer-cancel-icon size-3 fill-current" />
        </Button>
      </ComposerPrimitive.Cancel>
    </AuiIf>
  </div>
);

const AssistantMessage: FC = () => (
  <MessagePrimitive.Root data-slot="aui_assistant-message-root" data-role="assistant" className="animate-in fade-in zoom-in-95 relative duration-700 ease-out fill-mode-both">
    <div className="flex items-end gap-2 px-2">
      <div className="size-7 shrink-0 mb-0.5 flex items-center justify-center rounded-full text-white text-[11px] font-bold" style={{ backgroundColor: "#E8427A" }}>
        P
      </div>
      <div className="min-w-0 flex-1">
        <div data-slot="aui_assistant-message-content" className="text-sm px-4 py-3 leading-relaxed wrap-break-word" style={{ backgroundColor: "#F5F5F5", borderRadius: "16px 16px 16px 2px", color: "#111111" }}>
          <MessagePrimitive.GroupedParts
            groupBy={groupPartByType({
              reasoning: ["group-chainOfThought", "group-reasoning"],
              "tool-call": ["group-chainOfThought", "group-tool"],
              "standalone-tool-call": [],
            })}
          >
            {({ part, children }) => {
              switch (part.type) {
                case "group-chainOfThought":
                  return <div data-slot="aui_chain-of-thought">{children}</div>;
                case "group-reasoning": {
                  const running = part.status.type === "running";
                  return (
                    <ReasoningRoot defaultOpen={running}>
                      <ReasoningTrigger active={running} />
                      <ReasoningContent aria-busy={running}>
                        <ReasoningText>{children}</ReasoningText>
                      </ReasoningContent>
                    </ReasoningRoot>
                  );
                }
                case "group-tool":
                  return (
                    <ToolGroupRoot>
                      <ToolGroupTrigger count={part.indices.length} active={part.status.type === "running"} />
                      <ToolGroupContent>{children}</ToolGroupContent>
                    </ToolGroupRoot>
                  );
                case "text":
                  return <MarkdownText />;
                case "reasoning":
                  return <Reasoning {...part} />;
                case "tool-call":
                  return part.toolUI ?? <ToolFallback {...part} />;
                case "indicator":
                  return <span data-slot="aui_assistant-message-indicator" className="animate-pulse font-sans" aria-label="Assistant is working">{"●"}</span>;
                default:
                  return null;
              }
            }}
          </MessagePrimitive.GroupedParts>
          <MessagePrimitive.Error>
            <ErrorPrimitive.Root className="aui-message-error-root border-destructive bg-destructive/10 text-destructive mt-2 rounded-md border p-3 text-sm">
              <ErrorPrimitive.Message className="line-clamp-2" />
            </ErrorPrimitive.Root>
          </MessagePrimitive.Error>
        </div>
        <div data-slot="aui_assistant-message-footer" className="ms-2 -mb-7.5 min-h-7.5 pt-1.5 flex items-center">
          <BranchPicker />
          <AssistantActionBar />
        </div>
      </div>
    </div>
  </MessagePrimitive.Root>
);

const AssistantActionBar: FC = () => (
  <ActionBarPrimitive.Root hideWhenRunning autohide="not-last" className="aui-assistant-action-bar-root text-muted-foreground col-start-3 row-start-2 -ms-1 flex gap-1">
    <ActionBarPrimitive.Copy asChild>
      <TooltipIconButton tooltip="Copy">
        <AuiIf condition={(s) => s.message.isCopied}><CheckIcon /></AuiIf>
        <AuiIf condition={(s) => !s.message.isCopied}><CopyIcon /></AuiIf>
      </TooltipIconButton>
    </ActionBarPrimitive.Copy>
    <ActionBarPrimitive.Reload asChild>
      <TooltipIconButton tooltip="Refresh"><RefreshCwIcon /></TooltipIconButton>
    </ActionBarPrimitive.Reload>
  </ActionBarPrimitive.Root>
);

const UserMessage: FC = () => (
  <MessagePrimitive.Root data-slot="aui_user-message-root" className="animate-in fade-in zoom-in-95 duration-700 ease-out fill-mode-both px-2" data-role="user">
    <UserMessageAttachments />
    <div className="flex items-end justify-end">
      <div className="relative min-w-0 max-w-[75%]">
        <div className="aui-user-message-content peer px-4 py-3 text-white text-sm wrap-break-word empty:hidden" style={{ backgroundColor: "#E8427A", borderRadius: "16px 16px 2px 16px" }}>
          <MessagePrimitive.Parts />
        </div>
        <div className="aui-user-action-bar-wrapper absolute start-0 top-1/2 -translate-x-full -translate-y-1/2 pe-2 peer-empty:hidden">
          <UserActionBar />
        </div>
      </div>
    </div>
    <BranchPicker data-slot="aui_user-branch-picker" className="-me-1 justify-end pe-9" />
  </MessagePrimitive.Root>
);

const UserActionBar: FC = () => (
  <ActionBarPrimitive.Root hideWhenRunning autohide="not-last" className="aui-user-action-bar-root flex flex-col items-end">
    <ActionBarPrimitive.Edit asChild>
      <TooltipIconButton tooltip="Edit" className="aui-user-action-edit p-4"><PencilIcon /></TooltipIconButton>
    </ActionBarPrimitive.Edit>
  </ActionBarPrimitive.Root>
);

const EditComposer: FC = () => (
  <MessagePrimitive.Root data-slot="aui_edit-composer-wrapper" className="flex flex-col px-2">
    <ComposerPrimitive.Root className="aui-edit-composer-root bg-muted ms-auto flex w-full max-w-[85%] flex-col rounded-2xl">
      <ComposerPrimitive.Input className="aui-edit-composer-input text-foreground min-h-14 w-full resize-none bg-transparent p-4 text-sm outline-none" autoFocus />
      <div className="aui-edit-composer-footer mx-3 mb-3 flex items-center gap-2 self-end">
        <ComposerPrimitive.Cancel asChild><Button variant="ghost" size="sm">Cancel</Button></ComposerPrimitive.Cancel>
        <ComposerPrimitive.Send asChild><Button size="sm">Update</Button></ComposerPrimitive.Send>
      </div>
    </ComposerPrimitive.Root>
  </MessagePrimitive.Root>
);

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({ className, ...rest }) => (
  <BranchPickerPrimitive.Root hideWhenSingleBranch className={cn("aui-branch-picker-root text-muted-foreground -ms-2 me-2 inline-flex items-center text-xs", className)} {...rest}>
    <BranchPickerPrimitive.Previous asChild><TooltipIconButton tooltip="Previous"><ChevronLeftIcon /></TooltipIconButton></BranchPickerPrimitive.Previous>
    <span className="aui-branch-picker-state font-medium"><BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count /></span>
    <BranchPickerPrimitive.Next asChild><TooltipIconButton tooltip="Next"><ChevronRightIcon /></TooltipIconButton></BranchPickerPrimitive.Next>
  </BranchPickerPrimitive.Root>
);
