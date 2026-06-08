import { memo, useCallback, useRef, useState, type FC, type PropsWithChildren } from "react";
import { ChevronDownIcon, LoaderIcon } from "lucide-react";
import { useScrollLock } from "@assistant-ui/react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const ANIMATION_DURATION = 200;

export function ToolGroupRoot({
  className,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  defaultOpen = false,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Collapsible>, "open" | "onOpenChange"> & {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}) {
  const collapsibleRef = useRef<HTMLDivElement>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const lockScroll = useScrollLock(collapsibleRef, ANIMATION_DURATION);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) lockScroll();
      if (!isControlled) setUncontrolledOpen(open);
      controlledOnOpenChange?.(open);
    },
    [lockScroll, isControlled, controlledOnOpenChange],
  );
  return (
    <Collapsible
      ref={collapsibleRef}
      data-variant="outline"
      open={isOpen}
      onOpenChange={handleOpenChange}
      className={cn("aui-tool-group-root group/tool-group-root w-full rounded-lg border py-3", className)}
      style={{ ["--animation-duration" as string]: `${ANIMATION_DURATION}ms` }}
      {...props}
    >
      {children}
    </Collapsible>
  );
}

export function ToolGroupTrigger({ count, active = false, className, ...props }: React.ComponentProps<typeof CollapsibleTrigger> & { count: number; active?: boolean }) {
  const label = `${count} tool ${count === 1 ? "call" : "calls"}`;
  return (
    <CollapsibleTrigger
      className={cn("aui-tool-group-trigger group/trigger flex w-full items-center gap-2 px-4 text-sm transition-colors", className)}
      {...props}
    >
      {active && <LoaderIcon className="size-4 shrink-0 animate-spin" />}
      <span className="relative inline-block grow text-start leading-none font-medium">
        <span>{label}</span>
        {active && <span aria-hidden className="shimmer pointer-events-none absolute inset-0">{label}</span>}
      </span>
      <ChevronDownIcon className={cn("size-4 shrink-0 transition-transform duration-(--animation-duration) ease-out group-data-[state=closed]/trigger:-rotate-90 group-data-[state=open]/trigger:rotate-0")} />
    </CollapsibleTrigger>
  );
}

export function ToolGroupContent({ className, children, ...props }: React.ComponentProps<typeof CollapsibleContent>) {
  return (
    <CollapsibleContent
      className={cn(
        "aui-tool-group-content relative overflow-hidden text-sm outline-none group/collapsible-content ease-out",
        "data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
        "data-[state=closed]:fill-mode-forwards data-[state=closed]:pointer-events-none",
        "data-[state=open]:duration-(--animation-duration) data-[state=closed]:duration-(--animation-duration)",
        className,
      )}
      {...props}
    >
      <div className="mt-3 flex flex-col gap-2 border-t px-4 pt-3">{children}</div>
    </CollapsibleContent>
  );
}

const ToolGroupImpl: FC<PropsWithChildren<{ startIndex: number; endIndex: number }>> = ({ children, startIndex, endIndex }) => (
  <ToolGroupRoot>
    <ToolGroupTrigger count={endIndex - startIndex + 1} />
    <ToolGroupContent>{children}</ToolGroupContent>
  </ToolGroupRoot>
);

export const ToolGroup = memo(ToolGroupImpl);
