// src/utils/validation.ts

/**
 * Validate email address format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether the email is valid
 */
export const isValidEmail = (email: string | null | undefined): boolean => {
    if (!email) return false
    // Basic regex, consider using a more robust library for production if needed
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Validate phone number (10 digits for India)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Whether the phone is valid
 */
export const isValidPhone = (phone: string | null | undefined): boolean => {
    if (!phone) return false
    const cleaned = phone.replace(/\D/g, "") // Remove non-digits
    const phoneRegex = /^\d{10}$/
    return phoneRegex.test(cleaned)
}

/**
 * Validate pincode (6 digits for India)
 * @param {string} pincode - Pincode to validate
 * @returns {boolean} Whether the pincode is valid
 */
export const isValidPincode = (pincode: string | null | undefined): boolean => {
    if (!pincode) return false
    const cleaned = pincode.replace(/\D/g, "") // Remove non-digits
    const pincodeRegex = /^\d{6}$/
    return pincodeRegex.test(cleaned)
}

/**
 * Validate full name (basic check: at least two parts with letters)
 * @param {string} name - Name to validate
 * @returns {boolean} Whether the name is valid
 */
export const isValidName = (name: string | null | undefined): boolean => {
    if (!name) return false
    // Simple check for at least two words separated by a space, containing letters
    // Allows for hyphens, apostrophes within names if needed: /^[A-Za-z][A-Za-z'\- ]+[A-Za-z]$/
    const nameRegex = /^[A-Za-z]+(?: [A-Za-z'\-]+)+$/
    return nameRegex.test(name.trim())
}

/**
 * Check if a field has a non-empty value
 * @param {any} value - Value to check
 * @returns {boolean} Whether the field has a value
 */
export const hasValue = (value: any): boolean => {
    if (value === null || value === undefined) return false
    if (typeof value === "string") return value.trim() !== ""
    if (Array.isArray(value)) return value.length > 0
    // Consider other types like File, Object etc. if needed
    if (typeof value === "number") return true // 0 is a value
    if (typeof value === "boolean") return true // false is a value
    if (typeof value === "object") return Object.keys(value).length > 0 // Basic check for non-empty object
    return false // Default to false for unknown types
}

// --- Interfaces for Form Data (adjust based on actual usage) ---

interface UserInfoFormData {
    fullName?: string | null
    email?: string | null
    phone?: string | null
    address?: string | null
    city?: string | null
    state?: string | null
    pincode?: string | null
    termsAccepted?: boolean | null // Added for validation
}

interface VehicleConfigFormData {
    location?: string | null
    selectedVehicle?: string | number | null // Assuming ID
    selectedVariant?: string | number | null // Assuming ID
    selectedColor?: string | number | null // Assuming ID
    // optionalComponents might be validated elsewhere or not needed here
}

// --- Validation Functions ---

/**
 * Validate a user information form
 * @param {UserInfoFormData} formData - Form data to validate
 * @returns {Record<string, string>} Object with validation errors, empty if valid
 */
export const validateUserInfo = (
    formData: UserInfoFormData
): Record<string, string> => {
    const errors: Record<string, string> = {}

    if (!hasValue(formData.fullName)) {
        errors.fullName = "Full name is required"
    } else if (!isValidName(formData.fullName)) {
        errors.fullName =
            "Please enter a valid full name (first and last name)"
    }

    if (!hasValue(formData.email)) {
        errors.email = "Email is required"
    } else if (!isValidEmail(formData.email)) {
        errors.email = "Please enter a valid email address"
    }

    if (!hasValue(formData.phone)) {
        errors.phone = "Phone number is required"
    } else if (!isValidPhone(formData.phone)) {
        errors.phone = "Please enter a valid 10-digit phone number"
    }

    if (!hasValue(formData.address)) {
        errors.address = "Address is required"
    }

    if (!hasValue(formData.city)) {
        errors.city = "City is required"
    }

    if (!hasValue(formData.state)) {
        errors.state = "State is required"
    }

    if (!hasValue(formData.pincode)) {
        errors.pincode = "Pincode is required"
    } else if (!isValidPincode(formData.pincode)) {
        errors.pincode = "Please enter a valid 6-digit pincode"
    }

    // Check terms acceptance (if it exists in the passed formData)
    if (formData.termsAccepted === false) {
        errors.termsAccepted = "You must accept the terms and conditions"
    }

    return errors
}

/**
 * Validate vehicle configuration form
 * @param {VehicleConfigFormData} formData - Form data to validate
 * @returns {Record<string, string>} Object with validation errors, empty if valid
 */
export const validateVehicleConfig = (
    formData: VehicleConfigFormData
): Record<string, string> => {
    const errors: Record<string, string> = {}

    if (!hasValue(formData.location)) {
        errors.location = "Please select a delivery location"
    }

    if (!hasValue(formData.selectedVehicle)) {
        errors.selectedVehicle = "Please select a vehicle"
    }

    if (!hasValue(formData.selectedVariant)) {
        errors.selectedVariant = "Please select a variant"
    }

    if (!hasValue(formData.selectedColor)) {
        errors.selectedColor = "Please select a color"
    }

    return errors
}

/**
 * Validate OTP code (6 digits)
 * @param {string} otp - OTP to validate
 * @returns {boolean} Whether the OTP is valid
 */
export const isValidOTP = (otp: string | null | undefined): boolean => {
    if (!otp) return false
    const otpRegex = /^\d{6}$/
    return otpRegex.test(otp)
}