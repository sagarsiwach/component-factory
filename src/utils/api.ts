// src/utils/api.ts

/**
 * Base API URL - Make this configurable in a real app (e.g., via environment variables)
 */
const API_BASE_URL = "https://booking-engine.sagarsiwach.workers.dev/"

// --- Interfaces for API Data Structures (based on api.md) ---
// These should be refined based on actual API usage and full response details

interface ApiModel {
    id: number | string
    model_code?: string
    name: string
    description?: string
    image_url?: string // Assuming it's a string URL
    // Add other fields if needed
}

interface ApiVariant {
    id: number | string
    model_id: number | string
    code?: string
    title: string
    subtitle?: string
    description?: string
    price_addition?: number
    is_default?: boolean
    // Add other fields if needed
}

interface ApiColor {
    id: number | string
    model_id: number | string
    name: string
    color_value?: string // JSON string containing start/end colors? Needs parsing.
    hex_code?: string // Or maybe a direct hex code is available?
    is_default?: boolean
    // Add other fields if needed
}

interface ApiComponent {
    id: number | string
    model_id: number | string
    component_type?: string // e.g., ACCESSORY, PACKAGE, WARRANTY, SERVICE
    code?: string
    title: string
    subtitle?: string
    description?: string
    price?: number
    is_required?: boolean
    // Add other fields if needed
}

interface ApiPricing {
    id: number | string
    model_id: number | string
    state?: string
    city?: string
    pincode_start?: number
    pincode_end?: number
    base_price?: number
    fulfillment_fee?: number
    // Add other fields if needed
}

// Interface for the main data structure within the "data" field of the API response
export interface VehicleData {
    models: ApiModel[]
    variants: ApiVariant[]
    colors: ApiColor[]
    components: ApiComponent[]
    pricing: ApiPricing[]
    // Removed insurance/finance based on Framer code simplification
    // insurance_providers?: any[];
    // insurance_plans?: any[];
    // finance_providers?: any[];
    // finance_options?: any[];
}

// Interface for the overall API response structure
interface ApiResponse {
    status: "success" | "error"
    data?: VehicleData // Present on success
    message?: string // May be present on error
}

// Interface for Mapbox-like location features used in search
interface LocationFeature {
    id: string
    place_name: string
    place_type?: string[]
    context?: Array<{ id: string; text: string }>
    text?: string
    // Add other potential fields like center, geometry if needed
}

// --- API Fetch Functions ---

/**
 * Generic fetch function with error handling and basic typing
 * @param {string} endpoint - API endpoint (relative to API_BASE_URL)
 * @param {RequestInit} [options] - Fetch options (method, headers, body, etc.)
 * @returns {Promise<T>} API response data (parsed JSON)
 * @template T The expected type of the successful response data
 */
async function fetchApi<T>(
    endpoint: string = "",
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}${endpoint.includes("?") ? "&" : "?"}t=${Date.now()}` // Cache busting

    const defaultOptions: RequestInit = {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            // Add other headers like Authorization if needed
        },
        credentials: "omit", // Adjust as needed based on CORS setup
    }

    try {
        const response = await fetch(url, { ...defaultOptions, ...options })

        if (!response.ok) {
            // Attempt to get error details from response body if possible
            let errorBody = null
            try {
                errorBody = await response.json()
            } catch (e) {
                // Ignore if body isn't JSON
            }
            console.error("API Error Response:", {
                status: response.status,
                statusText: response.statusText,
                body: errorBody,
            })
            throw new Error(
                `API request failed: ${response.status} ${response.statusText}`
            )
        }

        // Handle potential empty responses
        const responseText = await response.text()
        if (!responseText || responseText.trim() === "") {
            // Decide how to handle empty responses - throw error or return null/empty object?
            // Returning null might be safer if empty responses are possible but not errors.
            // Throwing an error is stricter. Let's throw for now.
            throw new Error("Empty response received from API")
        }

        try {
            return JSON.parse(responseText) as T // Assume the caller knows the expected type T
        } catch (parseError) {
            console.error("API JSON parsing error:", parseError)
            console.error("Response text was:", responseText)
            throw new Error(`Failed to parse API response: ${parseError}`)
        }
    } catch (error) {
        console.error(`API request to ${endpoint} failed:`, error)
        // Re-throw the error so the caller can handle it
        throw error
    }
}

/**
 * Fetch vehicle data including models, variants, colors, components, and pricing
 * @returns {Promise<VehicleData>} Vehicle data object
 */
export async function fetchVehicleData(): Promise<VehicleData> {
    try {
        // Assuming the base endpoint returns the structure defined in ApiResponse
        const result = await fetchApi<ApiResponse>("/") // Adjust endpoint if needed

        if (result.status === "success" && result.data) {
            // Basic validation of the data structure could be added here
            if (
                !result.data.models ||
                !result.data.variants ||
                !result.data.colors ||
                !result.data.components ||
                !result.data.pricing
            ) {
                throw new Error("Incomplete data structure received from API")
            }
            return result.data
        } else {
            throw new Error(
                `API returned status '${result.status}' or missing data. Message: ${result.message || "N/A"}`
            )
        }
    } catch (error) {
        console.error("Error fetching vehicle data:", error)
        // Propagate the error
        throw error
    }
}

/**
 * Search location data by query (pincode or city name) using local pricing data.
 * NOTE: This performs a local filter, not a real API call.
 * @param {string} query - Search query (pincode or text)
 * @param {VehicleData | null} vehicleData - The fetched vehicle data containing pricing info
 * @returns {LocationFeature[]} An array of location results formatted like Mapbox features
 */
export function searchLocationFromPricing(
    query: string,
    vehicleData: VehicleData | null
): LocationFeature[] {
    if (!query || !vehicleData || !vehicleData.pricing) {
        return []
    }

    const cleanedQuery = query.trim()
    const results: LocationFeature[] = []

    try {
        // Check if it's a 6-digit pincode
        if (/^\d{6}$/.test(cleanedQuery)) {
            const pincodeNum = parseInt(cleanedQuery, 10)
            vehicleData.pricing.forEach((p) => {
                if (
                    p.pincode_start !== undefined &&
                    p.pincode_end !== undefined &&
                    p.pincode_start <= pincodeNum &&
                    p.pincode_end >= pincodeNum
                ) {
                    results.push({
                        id: `loc-pincode-${p.id}`,
                        place_name: `${cleanedQuery}, ${p.city || ""}, ${p.state || ""}, India`.replace(
                            / ,/g,
                            ","
                        ), // Basic cleanup
                        place_type: ["postcode"],
                        context: [
                            { id: `postcode.${p.id}`, text: cleanedQuery },
                            { id: `place.${p.id}`, text: p.city || "" },
                            { id: `region.${p.id}`, text: p.state || "" },
                        ].filter((ctx) => ctx.text), // Remove context items with empty text
                        text: cleanedQuery,
                    })
                }
            })
        } else if (cleanedQuery.length >= 3) {
            // Search based on city/state (case-insensitive)
            const lowerCaseQuery = cleanedQuery.toLowerCase()
            const addedCities = new Set<string>() // Prevent duplicate cities/states

            vehicleData.pricing.forEach((p) => {
                const cityMatch =
                    p.city && p.city.toLowerCase().includes(lowerCaseQuery)
                const stateMatch =
                    p.state && p.state.toLowerCase().includes(lowerCaseQuery)

                if (cityMatch || stateMatch) {
                    const placeIdentifier = `${p.city || ""}-${p.state || ""}`.toLowerCase()
                    if (!addedCities.has(placeIdentifier)) {
                        results.push({
                            id: `loc-text-${p.id}`,
                            place_name: `${p.city || ""}, ${p.state || ""}, India`.replace(
                                / ,/g,
                                ","
                            ),
                            place_type: ["place"], // Could be 'region' if only state matched
                            context: [
                                { id: `place.${p.id}`, text: p.city || "" },
                                { id: `region.${p.id}`, text: p.state || "" },
                            ].filter((ctx) => ctx.text),
                            text: cityMatch ? p.city : p.state, // Prioritize city as text
                        })
                        addedCities.add(placeIdentifier)
                    }
                }
            })
        }
        return results
    } catch (error) {
        console.error("Error searching location within pricing data:", error)
        return [] // Return empty array on error
    }
}

// --- Mock/Simulated API Functions ---
// Replace these with actual API calls when backend is ready

interface SubmitBookingPayload {
    // Define the structure based on what your backend expects
    location: string
    selectedVehicle: string | number
    selectedVariant: string | number
    selectedColor: string | number
    optionalComponents: Array<string | number>
    fullName: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    pincode: string
    totalPrice: number
    vehicleName: string
    vehicleCode: string
}

interface SubmitBookingResponse {
    status: "success" | "error"
    bookingId?: string
    estimatedDelivery?: string
    message?: string
}

/**
 * Submit booking form data (MOCK IMPLEMENTATION)
 * @param {SubmitBookingPayload} formData - Booking form data
 * @returns {Promise<SubmitBookingResponse>} Submission result
 */
export async function submitBooking(
    formData: SubmitBookingPayload
): Promise<SubmitBookingResponse> {
    console.log("MOCK: Submitting booking form:", formData)
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate network delay

    // Simulate success
    const bookingId = `KM-${Math.floor(Math.random() * 9000000) + 1000000}`
    return {
        status: "success",
        bookingId,
        estimatedDelivery: "15 May, 2025", // Example date
    }
    // Simulate failure:
    // return { status: "error", message: "Failed to save booking." };
}

interface OtpResponse {
    status: "success" | "error"
    message?: string
}

/**
 * Send OTP (MOCK IMPLEMENTATION)
 * @param {string} phone - User's phone number (digits only)
 * @param {string} email - User's email address
 * @param {boolean} [useEmail=false] - Whether to send OTP to email instead of phone
 * @returns {Promise<OtpResponse>} OTP sending result
 */
export async function sendOTP(
    phone: string,
    email: string,
    useEmail: boolean = false
): Promise<OtpResponse> {
    const destination = useEmail ? email : `+91 ${phone}` // Assuming +91 prefix
    console.log(
        `MOCK: Sending OTP to ${destination} via ${useEmail ? "email" : "SMS"}`
    )
    await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay

    return {
        status: "success",
        message: `MOCK: OTP sent to ${destination}`,
    }
    // Simulate failure:
    // return { status: "error", message: "Failed to send OTP." };
}

interface VerifyOtpResponse {
    status: "success" | "error"
    verified: boolean
    message?: string
}

/**
 * Verify OTP code (MOCK IMPLEMENTATION)
 * @param {string} otp - OTP code to verify
 * @param {string} phoneOrEmail - Identifier used for OTP request (for logging/context)
 * @returns {Promise<VerifyOtpResponse>} Verification result
 */
export async function verifyOTP(
    otp: string,
    phoneOrEmail: string // Added for context
): Promise<VerifyOtpResponse> {
    console.log(`MOCK: Verifying OTP ${otp} for ${phoneOrEmail}`)
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate network delay

    // Use "123456" as the magic OTP for demo
    if (otp === "123456") {
        return {
            status: "success",
            verified: true,
        }
    } else {
        return {
            status: "error",
            verified: false,
            message: "Invalid OTP code",
        }
    }
}

interface PaymentResponse {
    status: "success" | "error"
    transactionId?: string
    message?: string
}

/**
 * Process payment (MOCK IMPLEMENTATION)
 * @param {any} paymentDetails - Placeholder for payment details (e.g., amount, method)
 * @returns {Promise<PaymentResponse>} Payment result
 */
export async function processPayment(
    paymentDetails: any
): Promise<PaymentResponse> {
    console.log("MOCK: Processing payment:", paymentDetails)
    await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate network delay

    // Simulate success based on some logic or randomly
    const success = Math.random() > 0.2 // 80% chance of success for demo
    if (success) {
        return {
            status: "success",
            transactionId: `TX-${Date.now()}-${Math.round(Math.random() * 1000000)}`,
            message: "MOCK: Payment processed successfully",
        }
    } else {
        return {
            status: "error",
            message: "MOCK: Payment failed.",
        }
    }
}