import { MessageCircleIcon, XIcon } from "lucide-react";
import { type FC, forwardRef } from "react";
import { AssistantModalPrimitive } from "@assistant-ui/react";
import { Thread } from "@/components/assistant-ui/thread";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { cn } from "@/lib/utils";

export const AssistantModal: FC = () => {
  return (
    <AssistantModalPrimitive.Root>
      <AssistantModalPrimitive.Anchor className="aui-root aui-modal-anchor fixed end-6 bottom-6 size-14">
        <AssistantModalPrimitive.Trigger asChild>
          <AssistantModalButton />
        </AssistantModalPrimitive.Trigger>
      </AssistantModalPrimitive.Anchor>
      <AssistantModalPrimitive.Content
        sideOffset={16}
        className="aui-root aui-modal-content data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-1/2 data-[state=closed]:slide-out-to-right-1/2 data-[state=closed]:zoom-out data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-1/2 data-[state=open]:slide-in-from-right-1/2 data-[state=open]:zoom-in bg-popover text-popover-foreground data-[state=closed]:animate-out data-[state=open]:animate-in z-50 h-[520px] w-[360px] overflow-clip overscroll-contain p-0 outline-none [&>.aui-thread-root]:bg-inherit [&>.aui-thread-root_.aui-thread-viewport-footer]:bg-inherit"
        style={{
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0,0,0,.15), 0 2px 8px rgba(0,0,0,.08)",
        }}
      >
        <Thread />
      </AssistantModalPrimitive.Content>
    </AssistantModalPrimitive.Root>
  );
};

type AssistantModalButtonProps = { "data-state"?: "open" | "closed" };

const AssistantModalButton = forwardRef<HTMLButtonElement, AssistantModalButtonProps>(
  ({ "data-state": state, ...rest }, ref) => {
    const isOpen = state === "open";
    const tooltip = isOpen ? "Chat schließen" : "Chat öffnen";
    return (
      <TooltipIconButton
        variant="ghost"
        tooltip={tooltip}
        side="left"
        {...rest}
        className={cn(
          "aui-modal-button size-full rounded-full text-white transition-all duration-200 hover:scale-105 active:scale-95",
          isOpen ? "bg-[#111111] hover:bg-[#222222]" : "bg-[#E8427A] hover:bg-[#D6306A]",
        )}
        style={{
          boxShadow: isOpen
            ? "0 4px 20px rgba(0,0,0,.25)"
            : "0 4px 20px rgba(232,66,122,.4)",
        }}
        ref={ref}
      >
        <MessageCircleIcon
          data-state={state}
          className="aui-modal-button-closed-icon absolute size-6 transition-all data-[state=closed]:scale-100 data-[state=closed]:rotate-0 data-[state=open]:scale-0 data-[state=open]:rotate-90"
        />
        <XIcon
          data-state={state}
          strokeWidth={2.5}
          className="aui-modal-button-open-icon absolute size-6 transition-all data-[state=closed]:scale-0 data-[state=closed]:-rotate-90 data-[state=open]:scale-100 data-[state=open]:rotate-0"
        />
        <span className="aui-sr-only sr-only">{tooltip}</span>
      </TooltipIconButton>
    );
  },
);

AssistantModalButton.displayName = "AssistantModalButton";
