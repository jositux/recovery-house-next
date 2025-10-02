import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (rating: number, comment: string) => void
  bookingId: string
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSubmit, bookingId }) => {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")

  console.log(bookingId)

  const handleSubmit = () => {
    onSubmit(rating, comment)
    setRating(0)
    setComment("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deja un puntaje del servicio</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`cursor-pointer ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-[#162F40]"}`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          <Textarea
            placeholder="Escribe tu comentario aquí..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Enviar Puntuación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ReviewModal

