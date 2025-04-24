// src/hooks/useStepNavigation.ts
import { useState, useCallback } from "react"

interface UseStepNavigationOptions {
    initialStep?: number
    totalSteps: number
    onStepChange?: (step: number) => void
}

interface UseStepNavigationReturn {
    currentStep: number
    nextStep: () => boolean
    prevStep: () => boolean
    goToStep: (step: number) => boolean
    resetSteps: () => void
    isFirstStep: boolean
    isLastStep: boolean
    progressPercentage: number
    stepHistory: number[]
}

/**
 * Custom hook for managing step navigation logic.
 * @param {UseStepNavigationOptions} options - Configuration options.
 * @returns {UseStepNavigationReturn} Step navigation state and methods.
 */
export default function useStepNavigation({
    initialStep = 1,
    totalSteps,
    onStepChange,
}: UseStepNavigationOptions): UseStepNavigationReturn {
    if (totalSteps <= 0) {
        throw new Error("useStepNavigation: totalSteps must be greater than 0")
    }
    if (initialStep < 1 || initialStep > totalSteps) {
        console.warn(
            `useStepNavigation: initialStep (${initialStep}) is outside the valid range (1-${totalSteps}). Defaulting to 1.`
        )
        initialStep = 1
    }

    const [currentStep, setCurrentStep] = useState<number>(initialStep)
    const [stepHistory, setStepHistory] = useState<number[]>([initialStep])

    /** Navigate to the next step if possible. */
    const nextStep = useCallback((): boolean => {
        if (currentStep < totalSteps) {
            const nextStepValue = currentStep + 1
            setCurrentStep(nextStepValue)
            setStepHistory((prev) => [...prev, nextStepValue])
            if (onStepChange) {
                onStepChange(nextStepValue)
            }
            return true
        }
        return false
    }, [currentStep, totalSteps, onStepChange])

    /** Navigate to the previous step if possible. */
    const prevStep = useCallback((): boolean => {
        // Allow going back only if there's history to go back to
        if (stepHistory.length > 1) {
            const newHistory = stepHistory.slice(0, -1) // Remove current step
            const prevStepValue = newHistory[newHistory.length - 1] // Get the new last step
            setCurrentStep(prevStepValue)
            setStepHistory(newHistory)

            if (onStepChange) {
                onStepChange(prevStepValue)
            }
            return true
        }
        // Special case: if currentStep > 1 but history somehow is just [1], allow going back to 1
        if (currentStep > 1 && stepHistory.length === 1 && stepHistory[0] === 1) {
             setCurrentStep(1);
             // Keep history as [1]
             if (onStepChange) onStepChange(1);
             return true;
        }
        return false
    }, [currentStep, stepHistory, onStepChange])


    /** Navigate to a specific step if valid. Adjusts history accordingly. */
    const goToStep = useCallback(
        (step: number): boolean => {
            if (step >= 1 && step <= totalSteps) {
                setCurrentStep(step)

                // If going back to a step already in history, truncate history
                const historyIndex = stepHistory.indexOf(step)
                if (historyIndex !== -1) {
                    setStepHistory(stepHistory.slice(0, historyIndex + 1))
                } else {
                    // Going to a new step (forward or jumping past visited steps)
                    // This could create non-linear history, decide if that's desired.
                    // Simple approach: just add it. More complex: replace history after current index.
                    // Let's stick to the simple approach matching Framer hook's behavior:
                    setStepHistory((prev) => [...prev, step])
                }

                if (onStepChange) {
                    onStepChange(step)
                }
                return true
            }
            return false
        },
        [totalSteps, stepHistory, onStepChange]
    )

    /** Reset navigation to the initial step. */
    const resetSteps = useCallback(() => {
        setCurrentStep(initialStep)
        setStepHistory([initialStep])
        if (onStepChange) {
            onStepChange(initialStep)
        }
    }, [initialStep, onStepChange])

    const isFirstStep = currentStep === 1
    const isLastStep = currentStep === totalSteps

    // Calculate progress percentage (0% at step 1, 100% at last step)
    const progressPercentage =
        totalSteps > 1 ? ((currentStep - 1) / (totalSteps - 1)) * 100 : 0

    return {
        currentStep,
        nextStep,
        prevStep,
        goToStep,
        resetSteps,
        isFirstStep,
        isLastStep,
        progressPercentage,
        stepHistory,
    }
}