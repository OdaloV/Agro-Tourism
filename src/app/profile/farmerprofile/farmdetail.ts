'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { FarmerProfileData, FORM_STEPS } from './options'

const initialFormData: FarmerProfileData = {
  profilePhoto: null, 
  farmName: '', farmLocation: '', farmSize: '', yearEstablished: '', farmDescription: '',
  animals: [], customAnimals: [], newAnimalInput: '',
  crops: [], customCrops: [], newCropInput: '',
  activities: [], customActivities: [], newActivityInput: '', newActivityCategory: '',
  facilities: [], customfacilities: [], newFacilityInput: '',
  accommodation: false, accommodationDetails: '', maxGuests: '',
  farmPhotos: [], farmVideo: '',
  businessLicense: null, insuranceDocs: null, certifications: [], nationalID: null
}

export function useFarmerProfile() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FarmerProfileData>(initialFormData)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  
  // Memoized values
  const allAnimals = useMemo(() => [...formData.animals, ...formData.customAnimals], [formData.animals, formData.customAnimals])
  const allCrops = useMemo(() => [...formData.crops, ...formData.customCrops], [formData.crops, formData.customCrops])
  const allActivities = useMemo(() => [...formData.activities, ...formData.customActivities], [formData.activities, formData.customActivities])
  const allFacilities = useMemo(() => [...formData.facilities, ...formData.customfacilities], [formData.facilities, formData.customfacilities])
  
  const canProceed = useMemo(() => {
    const stepConfig = FORM_STEPS.find(s => s.id === currentStep)
    if (!stepConfig) return true
    return stepConfig.required.every(field => {
      if (field === 'activities') {
        return allActivities.length > 0
      }
      const value = formData[field as keyof FarmerProfileData]
      return value && (typeof value === 'string' ? value.trim() !== '' : true)
    })
  }, [currentStep, formData, allActivities])
  
  // Generic input handler
  const handleInputChange = useCallback((field: keyof FarmerProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (validationErrors[field]) setValidationErrors(prev => { const newErrors = { ...prev }; delete newErrors[field]; return newErrors })
  }, [validationErrors])

  // Generic checkbox handler
  const handleCheckboxChange = useCallback((field: 'animals' | 'crops' | 'activities' | 'facilities', item: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item) ? prev[field].filter(i => i !== item) : [...prev[field], item]
    }))
  }, [])

  // File handler
  const handleFileChange = useCallback((field: keyof FarmerProfileData, files: FileList | null) => {
    if (!files) return
    setFormData(prev => ({
      ...prev,
      [field]: field === 'farmPhotos' 
        ? [...prev.farmPhotos, ...Array.from(files).slice(0, 10)].slice(0, 10)
        : files[0]
    }))
  }, [])

  // Generic custom item handler
  const handleAddCustomItem = useCallback((
    type: 'animal' | 'crop' | 'activity' | 'facility',
    value: string,
    category?: string
  ) => {
    if (!value.trim()) return
    
    setFormData(prev => {
      if (type === 'animal') {
        return {
          ...prev,
          customAnimals: [...prev.customAnimals, value.trim()],
          newAnimalInput: ''
        }
      } else if (type === 'crop') {
        return {
          ...prev,
          customCrops: [...prev.customCrops, value.trim()],
          newCropInput: ''
        }
      } else if (type === 'activity') {
        const activityName = category 
          ? `${value.trim()} (${category})` 
          : value.trim()
        return {
          ...prev,
          customActivities: [...prev.customActivities, activityName],
          newActivityInput: '',
          newActivityCategory: ''
        }
      } else if (type === 'facility') {
        return {
          ...prev,
          customfacilities: [...prev.customfacilities, value.trim()],
          newFacilityInput: ''
        }
      }
      return prev
    })
  }, [])

  // Generic remove handler
  const handleRemove = useCallback((type: 'animal' | 'crop' | 'activity' | 'facility', item: string) => {
    setFormData(prev => {
      if (type === 'animal') {
        return { ...prev, customAnimals: prev.customAnimals.filter(a => a !== item) }
      }
      if (type === 'crop') {
        return { ...prev, customCrops: prev.customCrops.filter(c => c !== item) }
      }
      if (type === 'activity') {
        if (prev.customActivities.includes(item)) {
          return { ...prev, customActivities: prev.customActivities.filter(a => a !== item) }
        }
        return { ...prev, activities: prev.activities.filter(a => a !== item) }
      }
      if (type === 'facility') {
        if (prev.customfacilities.includes(item)) {
          return { ...prev, customfacilities: prev.customfacilities.filter(f => f !== item) }
        }
        return { ...prev, facilities: prev.facilities.filter(f => f !== item) }
      }
      return prev
    })
  }, [])

  // Validation
  const validateCurrentStep = useCallback((): boolean => {
    const errors: Record<string, string> = {}
    const stepConfig = FORM_STEPS.find(s => s.id === currentStep)
    
    if (stepConfig) {
      stepConfig.required.forEach(field => {
        if (field === 'activities') {
          if (allActivities.length === 0) {
            errors[field] = 'Please select at least one activity'
          }
        } else {
          const value = formData[field as keyof FarmerProfileData]
          if (!value || (typeof value === 'string' && !value.trim())) {
            errors[field] = `${field} is required`
          }
        }
      })
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [currentStep, formData, allActivities])

  // Navigation
  const goToNextStep = useCallback(() => validateCurrentStep() && setCurrentStep(prev => Math.min(prev + 1, FORM_STEPS.length)), [validateCurrentStep])
  const goToPreviousStep = useCallback(() => setCurrentStep(prev => Math.max(prev - 1, 1)), [])

  // Submit
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
  e.preventDefault()
  
  // Check each step manually to avoid TypeScript issues
  let allValid = true
  
  // Step 1 required fields
  if (!formData.farmName?.trim()) allValid = false
  if (!formData.farmLocation?.trim()) allValid = false
  if (!formData.farmDescription?.trim()) allValid = false
  
  // Step 3 requires at least one activity
  if (allActivities.length === 0) allValid = false
  
  if (!allValid) {
    setValidationErrors({ form: 'Please complete all required fields' })
    return
  }

  setIsSubmitting(true)
  try {
    console.log('Submitting:', { 
      ...formData, 
      allAnimals, 
      allCrops, 
      allActivities, 
      allFacilities 
    })
    await new Promise(resolve => setTimeout(resolve, 2000))
    router.push('/dashboard/farmer')
  } catch (error) {
    setValidationErrors({ form: 'Submission failed. Please try again.' })
  } finally {
    setIsSubmitting(false)
  }
}, [formData, allAnimals, allCrops, allActivities, allFacilities, router])

  return {
    currentStep, isSubmitting, formData, validationErrors, 
    allAnimals, allCrops, allActivities, allFacilities, canProceed,
    handleInputChange, handleCheckboxChange, handleFileChange, handleAddCustomItem, 
    handleRemove, goToNextStep, goToPreviousStep, handleSubmit, setFormData
  }
}