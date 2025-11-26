import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface PropertyCreatedModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
}

export function PropertyCreatedModal({ isOpen, onClose, title, description }: PropertyCreatedModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="text-md">{description}</DialogDescription>
        </DialogHeader>
        <Button className="bg-[#39759E]" onClick={onClose}>
          Entendido
        </Button>
      </DialogContent>
    </Dialog>
  )
}

