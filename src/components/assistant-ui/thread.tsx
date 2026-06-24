import { ComposerAttachments, UserMessageAttachments } from "@/components/assistant-ui/attachment";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import { Reasoning, ReasoningContent, ReasoningRoot, ReasoningText, ReasoningTrigger } from "@/components/assistant-ui/reasoning";
import { ToolGroupContent, ToolGroupRoot, ToolGroupTrigger } from "@/components/assistant-ui/tool-group";
import { ToolFallback } from "@/components/assistant-ui/tool-fallback";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  AssistantModalPrimitive,
  AuiIf,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  groupPartByType,
  MessagePrimitive,
  ThreadPrimitive,
  useAuiState,
} from "@assistant-ui/react";
import { useRestart } from "@/ChatWidget";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BotIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
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
        ["--composer-radius" as string]: "24px",
        ["--composer-padding" as string]: "10px",
      }}
    >
      <div className="relative flex shrink-0 items-center border-b border-border/60 bg-secondary/30 px-4 py-3 min-h-[52px]">
        <div className="flex items-center gap-2.5">
          <AuiIf condition={(s) => !s.thread.isEmpty}>
            <div className="flex items-center gap-2.5 animate-in fade-in slide-in-from-left-3 duration-500 ease-out">
              <Avatar className="size-8 ring-2 ring-[#CAB2F1]/50 ring-offset-1">
                <AvatarImage src={AVATAR_SRC} alt="Assistant" />
                <AvatarFallback className="bg-muted"><BotIcon className="size-4 text-muted-foreground" /></AvatarFallback>
              </Avatar>
              <span className="text-sm font-semibold animate-in fade-in slide-in-from-left-2 duration-700 ease-out delay-100 fill-mode-both">Poppy aka. AI Queen</span>
            </div>
          </AuiIf>
        </div>
        <AssistantModalPrimitive.Trigger asChild>
          <TooltipIconButton tooltip="Close" variant="ghost" className="size-9 rounded-lg bg-[#CAB2F1]/10 text-muted-foreground/50 hover:bg-destructive/12 hover:text-destructive/70 active:bg-destructive/20 transition-colors absolute" style={{ right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
            <XIcon className="size-5" strokeWidth={2.5} />
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
    <div className="aui-thread-welcome-center flex w-full grow flex-col items-center justify-center">
      <div className="aui-thread-welcome-message flex size-full flex-col justify-center px-4">
        <Avatar className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both mb-4 size-16 duration-200">
          <AvatarImage src={AVATAR_SRC} alt="Assistant" />
          <AvatarFallback className="bg-muted"><BotIcon className="size-8 text-muted-foreground" /></AvatarFallback>
        </Avatar>
        <h1 className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both text-2xl font-semibold duration-200">
          Hello there!
        </h1>
        <p className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both text-muted-foreground text-xl delay-75 duration-200">
          How can I help you today?
        </p>
      </div>
    </div>
  </div>
);

const Composer: FC = () => (
  <ComposerPrimitive.Root className="aui-composer-root relative flex w-full flex-col">
    <ComposerPrimitive.AttachmentDropzone asChild>
      <div
        data-slot="aui_composer-shell"
        className="bg-secondary/30 focus-within:border-ring/60 focus-within:bg-background focus-within:ring-2 focus-within:ring-ring/20 data-[dragging=true]:border-ring data-[dragging=true]:bg-accent/50 flex w-full flex-col gap-2 rounded-(--composer-radius) border border-border/70 p-(--composer-padding) transition-all data-[dragging=true]:border-dashed"
      >
        <ComposerAttachments />
        <ComposerPrimitive.Input
          placeholder="Type a message…"
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

const AVATAR_SRC = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ527SVWuVdqEdWGHKpT88Y2yqg9VXhRcwvGg&s";


const RestartChatButton: FC = () => {
  const restart = useRestart();
  return (
    <TooltipIconButton tooltip="Restart chat" variant="ghost" className="size-8 rounded-full" onClick={restart}>
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
    <div className="flex items-end gap-2">
      <Avatar className="size-7 shrink-0 mb-0.5 ring-1 ring-[#CAB2F1]/40">
        <AvatarImage src={AVATAR_SRC} alt="Assistant" />
        <AvatarFallback className="bg-muted">
          <BotIcon className="size-3.5 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 max-w-[80%]">
        <div data-slot="aui_assistant-message-content" className="text-foreground text-sm font-light rounded-2xl rounded-bl-sm px-4 py-3 leading-relaxed wrap-break-word" style={{ backgroundColor: "#f4f4f5" }}>
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
        <div data-slot="aui_assistant-message-footer" className="ms-2 flex items-center">
          <BranchPicker />
        </div>
      </div>
    </div>
  </MessagePrimitive.Root>
);


const UserMessage: FC = () => (
  <MessagePrimitive.Root data-slot="aui_user-message-root" className="animate-in fade-in zoom-in-95 duration-700 ease-out fill-mode-both" data-role="user">
    <UserMessageAttachments />
    <div className="flex items-end justify-end">
      <div className="min-w-0 max-w-[80%]">
        <div className="aui-user-message-content rounded-3xl rounded-br-md px-4 py-3 text-foreground text-sm font-light wrap-break-word empty:hidden" style={{ backgroundColor: "#cab1f1" }}>
          <MessagePrimitive.Parts />
        </div>
      </div>
    </div>
  </MessagePrimitive.Root>
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
