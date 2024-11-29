import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Fraunces } from 'next/font/google'

const fraunces = Fraunces({ subsets: ['latin'] })


interface TestimonialCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  location: string
  testimonial: string
  avatarUrl: string
}

export function TestimonialCard({ 
  name, 
  location, 
  testimonial, 
  avatarUrl,
  className,
  ...props 
}: TestimonialCardProps) {
  return (
    <Card className={cn("", className)} {...props}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar>
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className={`${fraunces.className} font-semibold text-base`}>{name}</h3>
            <p className="text-sm text-muted-foreground">{location}</p>
          </div>
        </div>
        <blockquote className="text-sm text-muted-foreground italic">
          {testimonial}
        </blockquote>
      </CardContent>
    </Card>
  )
}

