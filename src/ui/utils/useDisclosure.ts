import { useControllableState } from './useControllableState'

interface UseDisclosureProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

/** Controlled/uncontrolled open-state pattern shared by Popover and (later) Dialog/Menu. */
export function useDisclosure({ open, defaultOpen = false, onOpenChange }: UseDisclosureProps) {
  const [isOpen, setOpen] = useControllableState({ value: open, defaultValue: defaultOpen, onChange: onOpenChange })

  return {
    open: isOpen,
    show: () => setOpen(true),
    hide: () => setOpen(false),
    toggle: () => setOpen(!isOpen),
  }
}
