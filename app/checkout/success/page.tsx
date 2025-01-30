import { CheckCircle } from "lucide-react"
import { CardDescription, Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const SuccessPage = () => {
    return (
        <div className="text-center py-16">
          <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            ¡Te esperamos para tu estadía!
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <CardDescription className="text-center">
                Se ha procesado el pago correctamente.
              </CardDescription>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/mis-reservas" passHref>
              <Button className="w-full sm:w-auto">Ver tus reservas</Button>
            </Link>
            <Link href="/rooms" passHref>
              <Button variant="outline" className="w-full sm:w-auto">En otro momento</Button>
            </Link>
          </CardFooter>
              </Card>
        </div>
    )
}

export default SuccessPage