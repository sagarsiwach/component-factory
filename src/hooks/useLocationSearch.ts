// src/hooks/useLocationSearch.ts
import { useState, useRef, useCallback, RefObject } from "react"
import { searchLocationFromPricing, VehicleData } from "../utils/api" // Use relative path
import { formatLocationString } from "../utils/formatting" // Use relative path

// Define the structure of a location result (Mapbox-like feature)
interface LocationResult {
    id: string
    place_name: string
    // Add other properties if needed from the actual feature structure
    [key: string]: any // Allow other properties
}

type LocationStatus = "idle" | "searching" | "success" | "error"

interface UseLocationSearchReturn {
    location: string
    setLocation: React.Dispatch<React.SetStateAction<string>>
    locationStatus: LocationStatus
    setLocationStatus: React.Dispatch<React.SetStateAction<LocationStatus>>
    locationResults: LocationResult[]
    setLocationResults: React.Dispatch<React.SetStateAction<LocationResult[]>>
    showLocationResults: boolean
    setShowLocationResults: React.Dispatch<React.SetStateAction<boolean>>
    searchLocation: (query: string) => Promise<LocationResult[]> // Now returns results
    handleLocationSelect: (feature: LocationResult) => string // Returns formatted string
    getCurrentLocation: () => void // Mock implementation
    inputRef: RefObject<HTMLInputElement> // Allow associating an input ref
}

/**
 * Custom hook for location search functionality using local data filtering.
 * @param {VehicleData | null} vehicleData - Vehicle data containing pricing info for local search.
 * @returns {UseLocationSearchReturn} Location search methods and state.
 */
export default function useLocationSearch(
    vehicleData: VehicleData | null
): UseLocationSearchReturn {
    const [location, setLocation] = useState<string>("")
    const [locationStatus, setLocationStatus] =
        useState<LocationStatus>("idle")
    const [locationResults, setLocationResults] = useState<LocationResult[]>([])
    const [showLocationResults, setShowLocationResults] =
        useState<boolean>(false)

    const inputRef = useRef<HTMLInputElement>(null)

    // Search location by query using the local filtering function
    const searchLocation = useCallback(
        async (query: string): Promise<LocationResult[]> => {
            const trimmedQuery = query.trim()
            if (!trimmedQuery || trimmedQuery.length < 3) {
                setLocationResults([])
                setShowLocationResults(false)
                setLocationStatus("idle") // Reset status if query is too short
                return []
            }

            setLocationStatus("searching")

            try {
                // Use local search function with vehicle data
                const results = searchLocationFromPricing(trimmedQuery, vehicleData)

                setLocationResults(results)
                setShowLocationResults(results.length > 0)
                setLocationStatus(results.length > 0 ? "idle" : "error") // idle if results, error if not

                return results // Return the results
            } catch (error) {
                console.error("Error searching location:", error)
                setLocationStatus("error")
                setLocationResults([])
                setShowLocationResults(false)
                return [] // Return empty array on error
            }
        },
        [vehicleData] // Dependency on vehicleData
    )

    // Handle location selection from dropdown
    const handleLocationSelect = useCallback((feature: LocationResult): string => {
        const formattedLocation = formatLocationString(feature) // Use formatter from utils
        setLocation(formattedLocation)
        setLocationResults([]) // Clear results
        setShowLocationResults(false) // Hide dropdown
        setLocationStatus("success") // Mark as success
        // Optionally focus the input after selection if needed
        // inputRef.current?.focus();
        return formattedLocation // Return the selected value
    }, []) // No dependencies needed here as formatLocationString is pure

    // Handle getting current location (MOCK IMPLEMENTATION)
    const getCurrentLocation = useCallback(() => {
        setLocationStatus("searching")
        setLocationResults([]) // Clear results
        setShowLocationResults(false) // Hide dropdown

        // Simulate geolocation API
        console.log("MOCK: Attempting to get current location...")
        setTimeout(() => {
            // Mock success with a predefined location
            const mockLocation = "110001, Delhi, Delhi, India" // Example mock
            setLocation(mockLocation)
            setLocationStatus("success")
            console.log("MOCK: Set location to", mockLocation)

            // You might want to clear results and hide dropdown again here just in case
            setLocationResults([])
            setShowLocationResults(false)
        }, 1500) // Simulate delay
    }, []) // No dependencies

    return {
        location,
        setLocation,
        locationStatus,
        setLocationStatus,
        locationResults,
        setLocationResults,
        showLocationResults,
        setShowLocationResults,
        searchLocation,
        handleLocationSelect,
        getCurrentLocation,
        inputRef,
    }
}