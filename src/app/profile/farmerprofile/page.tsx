'use client'

import { useFarmerProfile } from './farmdetail'
import { 
  ANIMAL_OPTIONS, 
  CROP_OPTIONS, 
  ACTIVITY_CATEGORIES, 
  FACILITY_OPTIONS,
  FORM_STEPS 
} from './options'

export default function FarmerProfilePage() {
  const {
    currentStep,
    isSubmitting,
    formData,
    validationErrors,
    allAnimals,
    allCrops,
    allActivities,
    allFacilities,
    canProceed,
    handleInputChange,
    handleCheckboxChange,
    handleFileChange,
    handleAddCustomItem,
    handleRemove,
    goToNextStep,
    goToPreviousStep,
    handleSubmit
  } = useFarmerProfile()

  const getStepClass = (stepId: number): string => {
    const baseClass = 'w-8 h-8 mx-auto rounded-full flex items-center justify-center'
    if (currentStep > stepId) return `${baseClass} bg-green-500 text-white`
    if (currentStep === stepId) return `${baseClass} bg-primary text-white`
    return `${baseClass} bg-gray-200 text-gray-600`
  }

  const onAddCustomAnimal = () => handleAddCustomItem('animal', formData.newAnimalInput)
  const onAddCustomCrop = () => handleAddCustomItem('crop', formData.newCropInput)
  const onAddCustomActivity = () => handleAddCustomItem('activity', formData.newActivityInput, formData.newActivityCategory)
  const onAddCustomFacility = () => handleAddCustomItem('facility', formData.newFacilityInput)
  
  const onRemoveCustomAnimal = (animal: string) => handleRemove('animal', animal)
  const onRemoveCustomCrop = (crop: string) => handleRemove('crop', crop)
  const onRemoveActivity = (activity: string) => handleRemove('activity', activity)
  const onRemoveFacility = (facility: string) => handleRemove('facility', facility)

}