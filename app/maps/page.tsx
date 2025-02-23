"use client"

import { useState } from "react"
import GoogleMapsSelector, { type LocationDetails } from "./google-maps-selector"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<LocationDetails | null>(null)

  const handleLocationSelected = (details: LocationDetails) => {
    setSelectedLocation(details)
  }

  // Replace 'YOUR_GOOGLE_MAPS_API_KEY' with your actual Google Maps API key
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY"

  return (
    <main className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Location Selector Demo (Google Maps)</h1>
      <GoogleMapsSelector onLocationSelected={handleLocationSelected} apiKey={apiKey} />

      {selectedLocation && (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-2">Selected Location Details</h2>
            <p>
              <strong>Address:</strong> {selectedLocation.address}
            </p>
            <p>
              <strong>Latitude:</strong> {selectedLocation.lat.toFixed(6)}
            </p>
            <p>
              <strong>Longitude:</strong> {selectedLocation.lng.toFixed(6)}
            </p>
            <p>
              <strong>Postal Code:</strong> {selectedLocation.postalCode}
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  )
}

