// src/hooks/useFormValidation.ts
import { useState, useCallback, ChangeEvent, FocusEvent } from "react"
// We'll use the validation functions from our local utils
import * as Validators from "../utils/validation" // Or import specific functions needed

// Define generic types for flexibility
type FormValues = Record<string, any>
type FormErrors = Record<string, string | null | undefined>
type FormTouched = Record<string, boolean>

// Type for the validation schema function
type ValidationSchema<T extends FormValues> = (values: T) => FormErrors

interface UseFormValidationOptions<T extends FormValues> {
    initialValues: T
    validationSchema?: ValidationSchema<T>
    onSubmit: (values: T) => Promise<void> | void // Callback on successful submit
}

interface UseFormValidationReturn<T extends FormValues> {
    values: T
    errors: FormErrors
    touched: FormTouched
    isSubmitting: boolean
    isValid: boolean // Derived state for convenience
    handleChange: (
        name: keyof T,
        value: any
    ) => void // Simplified for direct value setting
    handleInputChange: (
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => void // For standard input events
    handleCheckboxChange: (event: ChangeEvent<HTMLInputElement>) => void // Specific for checkboxes
    handleBlur: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    handleSubmit: (event?: React.FormEvent<HTMLFormElement>) => Promise<void>
    resetForm: () => void
    setFieldValue: (name: keyof T, value: any) => void
    setValues: (newValues: T) => void
    setErrors: (newErrors: FormErrors) => void
    setTouched: (newTouched: FormTouched) => void
    validateField: (name: keyof T) => void // Validate a single field on demand
    validateForm: () => boolean // Validate the whole form on demand
}

/**
 * Custom hook for form validation and state management.
 * @template T The type representing the form's values.
 * @param {UseFormValidationOptions<T>} options - Configuration options.
 * @returns {UseFormValidationReturn<T>} Form state and utility functions.
 */
export default function useFormValidation<T extends FormValues>({
    initialValues,
    validationSchema,
    onSubmit,
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
    const [values, setValues] = useState<T>(initialValues || ({} as T))
    const [errors, setErrors] = useState<FormErrors>({})
    const [touched, setTouched] = useState<FormTouched>({})
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    // Derived state: check if the form is valid based on current errors
    const isValid = Object.keys(errors).length === 0

    // --- Core Validation Logic ---

    /** Validates a single field based on the schema */
    const validateSingleField = useCallback(
        (name: keyof T, currentValue: any): string | null => {
            if (!validationSchema) return null

            // Temporarily construct partial data for the specific field validation if schema expects full object
            // Or adjust schema function to handle partial validation if possible
            const fieldData = { ...values, [name]: currentValue } as T // Pass current state + new value
            const fieldErrors = validationSchema(fieldData)
            return fieldErrors[name as string] || null // Return error for the specific field
        },
        [validationSchema, values] // Depends on schema and current values for context
    )

    /** Validates the entire form based on the schema */
    const validateForm = useCallback((): boolean => {
        if (!validationSchema) {
            setErrors({}) // No schema, no errors
            return true
        }

        const formErrors = validationSchema(values)
        setErrors(formErrors)

        // Mark all fields with errors as touched
        if (Object.keys(formErrors).length > 0) {
            const newTouched = { ...touched }
            Object.keys(formErrors).forEach((key) => {
                newTouched[key] = true
            })
            setTouched(newTouched)
        }

        return Object.keys(formErrors).length === 0 // Return true if no errors
    }, [validationSchema, values, touched])

    // --- Event Handlers ---

    /** General handler to set a field's value directly */
    const handleChange = useCallback((name: keyof T, value: any) => {
        setValues((prev) => ({
            ...prev,
            [name]: value,
        }))
        // Optionally clear error on change
        if (errors[name as string]) {
            setErrors((prev) => ({
                ...prev,
                [name as string]: null,
            }))
        }
        // Mark field as touched on change
        setTouched((prev) => ({
            ...prev,
            [name as string]: true,
        }))
    }, [errors]) // Depends on errors state for clearing

    /** Handler for standard HTML input elements */
    const handleInputChange = useCallback(
        (
            event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
        ) => {
            const { name, value } = event.target
            handleChange(name as keyof T, value)
        },
        [handleChange] // Depends on the generic handleChange
    )

    /** Specific handler for checkbox input elements */
    const handleCheckboxChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const { name, checked } = event.target
            handleChange(name as keyof T, checked)
        },
        [handleChange]
    )

    /** Handler for input blur event - triggers validation for the field */
    const handleBlur = useCallback(
        (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name } = event.target
            // Mark field as touched
            setTouched((prev) => ({
                ...prev,
                [name]: true,
            }))
            // Validate the field that lost focus
            const error = validateSingleField(name as keyof T, values[name])
            setErrors((prev) => ({
                ...prev,
                [name]: error, // Update error state for this field
            }))
        },
        [validateSingleField, values] // Depends on validation logic and current values
    )

    /** Validates a specific field manually */
    const validateField = useCallback((name: keyof T) => {
        const error = validateSingleField(name, values[name]);
        setErrors((prev) => ({ ...prev, [name as string]: error }));
        // Optionally mark as touched when manually validating
        setTouched((prev) => ({ ...prev, [name as string]: true }));
    }, [validateSingleField, values]);


    /** Handler for form submission */
    const handleSubmit = useCallback(
        async (event?: React.FormEvent<HTMLFormElement>) => {
            if (event) {
                event.preventDefault() // Prevent default form submission
            }

            setIsSubmitting(true)
            const isFormValid = validateForm() // Validate all fields

            if (isFormValid) {
                try {
                    await onSubmit(values) // Call the provided onSubmit callback
                } catch (submitError) {
                    console.error("Form submission error:", submitError)
                    // Optionally set a global form error state here if needed
                    // setErrors(prev => ({ ...prev, form: 'Submission failed' }));
                }
            } else {
                console.log("Form validation failed", errors)
            }

            setIsSubmitting(false)
        },
        [validateForm, onSubmit, values, errors] // Depends on validation, callback, and current state
    )

    // --- Utility Functions ---

    /** Resets the form to its initial state */
    const resetForm = useCallback(() => {
        setValues(initialValues || ({} as T))
        setErrors({})
        setTouched({})
        setIsSubmitting(false)
    }, [initialValues])

    /** Manually sets the value of a specific field */
    const setFieldValue = useCallback((name: keyof T, value: any) => {
        setValues((prev) => ({
            ...prev,
            [name]: value,
        }))
        // Optionally touch the field when setting value manually
        setTouched((prev) => ({
            ...prev,
            [name as string]: true,
        }))
    }, [])

    return {
        values,
        errors,
        touched,
        isSubmitting,
        isValid,
        handleChange,
        handleInputChange,
        handleCheckboxChange,
        handleBlur,
        handleSubmit,
        resetForm,
        setFieldValue,
        setValues,
        setErrors,
        setTouched,
        validateField,
        validateForm,
    }
}