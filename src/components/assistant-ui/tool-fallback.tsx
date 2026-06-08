import { memo, useCallback, useRef, useState } from "react";
import { AlertCircleIcon, CheckIcon, ChevronDownIcon, LoaderIcon, XCircleIcon } from "lucide-react";
import {
  useScrollLock,
  type ToolCallMessagePart,
  type ToolCallMessagePartProps,
  type ToolCallMessagePartStatus,
  type ToolCallMessagePartComponent,
} from "@assistant-ui/react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ANIMATION_DURATION = 200;

function ToolFallbackRoot({ className, open: controlledOpen, onOpenChange: controlledOnOpenChange, defaultOpen = false, children, ...props }: Omit<React.ComponentProps<typeof Collapsible>, "open" | "onOpenChange"> & { open?: boolean; onOpenChange?: (open: boolean) => void; defaultOpen?: boolean }) {
  const collapsibleRef = useRef<HTMLDivElement>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const lockScroll = useScrollLock(collapsibleRef, ANIMATION_DURATION);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;
  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) lockScroll();
    if (!isControlled) setUncontrolledOpen(open);
    controlledOnOpenChange?.(open);
  }, [lockScroll, isControlled, controlledOnOpenChange]);
  return (
    <Collapsible ref={collapsibleRef} open={isOpen} onOpenChange={handleOpenChange}
      className={cn("aui-tool-fallback-root w-full rounded-lg border py-3", className)}
      style={{ ["--animation-duration" as string]: `${ANIMATION_DURATION}ms` }} {...props}
    >
      {children}
    </Collapsible>
  );
}

const statusIconMap: Record<ToolCallMessagePartStatus["type"], React.ElementType> = {
  running: LoaderIcon, complete: CheckIcon, incomplete: XCircleIcon, "requires-action": AlertCircleIcon,
};

function ToolFallbackTrigger({ toolName, status, className, ...props }: React.ComponentProps<typeof CollapsibleTrigger> & { toolName: string; status?: ToolCallMessagePartStatus }) {
  const statusType = status?.type ?? "complete";
  const isRunning = statusType === "running";
  const isCancelled = status?.type === "incomplete" && status.reason === "cancelled";
  const Icon = statusIconMap[statusType];
  const label = isCancelled ? "Cancelled tool" : "Used tool";
  return (
    <CollapsibleTrigger className={cn("group/trigger flex w-full items-center gap-2 px-4 text-sm transition-colors", className)} {...props}>
      <Icon className={cn("size-4 shrink-0", isCancelled && "text-muted-foreground", isRunning && "animate-spin")} />
      <span className={cn("relative inline-block grow text-start leading-none", isCancelled && "text-muted-foreground line-through")}>
        <span>{label}: <b>{toolName}</b></span>
        {isRunning && <span aria-hidden className="shimmer pointer-events-none absolute inset-0">{label}: <b>{toolName}</b></span>}
      </span>
      <ChevronDownIcon className="size-4 shrink-0 transition-transform duration-(--animation-duration) ease-out group-data-[state=closed]/trigger:-rotate-90 group-data-[state=open]/trigger:rotate-0" />
    </CollapsibleTrigger>
  );
}

function ToolFallbackContent({ className, children, ...props }: React.ComponentProps<typeof CollapsibleContent>) {
  return (
    <CollapsibleContent className={cn("relative overflow-hidden text-sm outline-none group/collapsible-content ease-out data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down data-[state=closed]:fill-mode-forwards data-[state=closed]:pointer-events-none data-[state=open]:duration-(--animation-duration) data-[state=closed]:duration-(--animation-duration)", className)} {...props}>
      <div className="mt-3 flex flex-col gap-2 border-t pt-2">{children}</div>
    </CollapsibleContent>
  );
}

const ToolFallbackImpl: ToolCallMessagePartComponent = ({ toolName, argsText, result, status, addResult, resume, interrupt, approval, respondToApproval }) => {
  const isCancelled = status?.type === "incomplete" && status.reason === "cancelled";
  const isRequiresAction = status?.type === "requires-action";
  const [open, setOpen] = useState(isRequiresAction);

  return (
    <ToolFallbackRoot open={open} onOpenChange={setOpen} className={cn(isCancelled && "border-muted-foreground/30 bg-muted/30")}>
      <ToolFallbackTrigger toolName={toolName} status={status} />
      <ToolFallbackContent>
        {argsText && <div className="px-4"><pre className="whitespace-pre-wrap">{argsText}</pre></div>}
        {isRequiresAction && (
          <div className="flex items-center gap-2 border-t border-dashed px-4 pt-2">
            <Button size="sm" onClick={() => { resume?.({ approved: true }); addResult?.(APPROVED); }}>Allow</Button>
            <Button size="sm" variant="outline" onClick={() => { resume?.({ approved: false }); addResult?.(DENIED); }}>Deny</Button>
          </div>
        )}
        {!isCancelled && result !== undefined && (
          <div className="border-t border-dashed px-4 pt-2">
            <p className="font-semibold">Result:</p>
            <pre className="whitespace-pre-wrap">{typeof result === "string" ? result : JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </ToolFallbackContent>
    </ToolFallbackRoot>
  );
};

const APPROVED = "Approved by user";
const DENIED = "User denied tool execution";

export const ToolFallback = memo(ToolFallbackImpl) as unknown as ToolCallMessagePartComponent;
ToolFallback.displayName = "ToolFallback";
