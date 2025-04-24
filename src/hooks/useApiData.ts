// src/hooks/useApiData.ts
import { useState, useEffect, useCallback } from "react"
import {
    fetchVehicleData,
    VehicleData,
    ApiVariant,
    ApiColor,
    ApiComponent,
    ApiPricing,
} from "../utils/api" // Use relative path

interface UseApiDataState {
    loading: boolean
    error: string | null
    data: VehicleData | null
    retry: () => void
    getVehiclePrice: (vehicleId: number | string) => number
    getVariantsForVehicle: (vehicleId: number | string) => ApiVariant[]
    getColorsForVehicle: (vehicleId: number | string) => ApiColor[]
    getComponentsForVehicle: (vehicleId: number | string) => ApiComponent[]
}

/**
 * Custom hook to fetch and manage API data (VehicleData)
 * @param {string} [apiUrl] - Optional API URL override (currently unused as fetchApi uses constant)
 * @returns {UseApiDataState} API data state and utility functions
 */
export default function useApiData(apiUrl?: string): UseApiDataState {
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<VehicleData | null>(null)
    const [retryCount, setRetryCount] = useState<number>(0)

    // Fetch data function
    const fetchData = useCallback(async () => {
        setLoading(true)
        setError(null)
        // Optionally clear data while loading: setData(null);

        try {
            // apiUrl parameter is currently not used by fetchVehicleData internally
            // If needed, modify fetchApi or fetchVehicleData to accept it.
            const vehicleData = await fetchVehicleData()
            setData(vehicleData)
            setError(null) // Clear error on success
        } catch (err) {
            console.error("Error in useApiData hook:", err)
            const errorMessage =
                err instanceof Error ? err.message : "An unknown error occurred"
            setError(
                `Failed to load vehicle data. Please try again. (${errorMessage})`
            )
            setData(null) // Clear data on error
        } finally {
            setLoading(false)
        }
    }, [apiUrl, retryCount]) // Dependency array includes retryCount

    // Retry function
    const retry = useCallback(() => {
        console.log("Retrying data fetch...")
        setRetryCount((prev) => prev + 1)
    }, [])

    // Initial fetch and retry effect
    useEffect(() => {
        console.log(
            `Fetching data... (Retry count: ${retryCount}, URL: ${apiUrl || "default"})`
        )
        fetchData()
    }, [fetchData]) // Use fetchData directly in dependency array

    // Utility function to get vehicle base price
    const getVehiclePrice = useCallback(
        (vehicleId: number | string): number => {
            if (!data?.pricing) return 0
            // Ensure consistent type comparison if IDs can be numbers or strings
            const vehicleIdStr = String(vehicleId)
            const pricing = data.pricing.find(
                (p) => String(p.model_id) === vehicleIdStr
            )
            return pricing?.base_price || 0
        },
        [data]
    )

    // Utility function to get variants for a vehicle
    const getVariantsForVehicle = useCallback(
        (vehicleId: number | string): ApiVariant[] => {
            if (!data?.variants) return []
            const vehicleIdStr = String(vehicleId)
            return data.variants.filter(
                (v) => String(v.model_id) === vehicleIdStr
            )
        },
        [data]
    )

    // Utility function to get colors for a vehicle
    const getColorsForVehicle = useCallback(
        (vehicleId: number | string): ApiColor[] => {
            if (!data?.colors) return []
            const vehicleIdStr = String(vehicleId)
            return data.colors.filter((c) => String(c.model_id) === vehicleIdStr)
        },
        [data]
    )

    // Utility function to get components for a vehicle
    const getComponentsForVehicle = useCallback(
        (vehicleId: number | string): ApiComponent[] => {
            if (!data?.components) return []
            const vehicleIdStr = String(vehicleId)
            return data.components.filter(
                (c) => String(c.model_id) === vehicleIdStr
            )
        },
        [data]
    )

    return {
        loading,
        error,
        data,
        retry,
        getVehiclePrice,
        getVariantsForVehicle,
        getColorsForVehicle,
        getComponentsForVehicle,
    }
}