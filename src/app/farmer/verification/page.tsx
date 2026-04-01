"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Upload,
  FileText,
  MapPin,
  Shield,
  Building,
  Trees,
  User,
  Eye,
  Download,
  Clock,
  XCircle,
  MessageCircle,
  Landmark,
} from "lucide-react";

// Define verification steps
const verificationSteps = [
  {
    id: 1,
    name: "Identity & KYC",
    description: "Verify your identity as the farm owner",
    icon: User,
    status: "pending",
  },
  {
    id: 2,
    name: "Land Ownership",
    description: "Proof of legal ownership (Ardhi House Standard)",
    icon: Landmark,
    status: "pending",
  },
  {
    id: 3,
    name: "Land State & Security",
    description: "NLC & NEMA environmental compliance",
    icon: Trees,
    status: "pending",
  },
  {
    id: 4,
    name: "Operational Permits",
    description: "Business licensing & insurance",
    icon: Shield,
    status: "pending",
  },
];

// Document requirements per step
const stepDocuments = {
  1: [
    { id: "national_id", name: "National ID / Passport", required: true },
    { id: "kra_pin", name: "KRA PIN Certificate", required: true },
    { id: "passport_photo", name: "Passport-Sized Photo", required: true },
    { id: "phone_verification", name: "Phone Verification", required: true },
  ],
  2: [
    { id: "title_deed", name: "Original Title Deed", required: true },
    {
      id: "digital_search",
      name: "Digital Land Search (Form LRA 85)",
      required: true,
    },
    { id: "rates_clearance", name: "Land Rates Clearance", required: true },
    { id: "rim_map", name: "Registry Index Map (RIM)", required: true },
  ],
  3: [
    { id: "beacon_certificate", name: "Beacon Certificate", required: true },
    {
      id: "riparian_check",
      name: "Riparian Reserve Compliance",
      required: true,
    },
    { id: "security_plan", name: "Site Security Plan", required: true },
    { id: "eia_license", name: "NEMA EIA License", required: false },
    { id: "water_permit", name: "WRA Water Permit", required: false },
  ],
  4: [
    { id: "business_permit", name: "Unified Business Permit", required: true },
    {
      id: "health_certificate",
      name: "Public Health Certificate",
      required: true,
    },
    {
      id: "liability_insurance",
      name: "Public Liability Insurance",
      required: true,
    },
    {
      id: "tra_license",
      name: "Tourism Regulatory Authority License",
      required: false,
    },
  ],
};

interface UploadedDoc {
  status: "pending" | "uploaded";
  file?: File;
  name?: string;
}

export default function FarmerVerificationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedDoc>>(
    {},
  );
  const [showHelp, setShowHelp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStepData = verificationSteps.find((s) => s.id === currentStep);
  const currentDocs =
    stepDocuments[currentStep as keyof typeof stepDocuments] || [];
  const progress = ((currentStep - 1) / verificationSteps.length) * 100;

  const isStepComplete = (stepId: number) => {
    const docs = stepDocuments[stepId as keyof typeof stepDocuments] || [];
    const requiredDocs = docs.filter((d) => d.required);
    return requiredDocs.every(
      (doc) => uploadedDocs[doc.id]?.status === "uploaded",
    );
  };

  const handleFileUpload = (docId: string, file: File) => {
    setUploadedDocs((prev) => ({
      ...prev,
      [docId]: {
        status: "uploaded",
        file,
        name: file.name,
      },
    }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Verification submitted! Our team will review your documents.");
    }, 1500);
  };

  const getStepIcon = (stepId: number) => {
    const step = verificationSteps.find((s) => s.id === stepId);
    if (!step) return null;
    const Icon = step.icon;
    return <Icon className="h-5 w-5" />;
  };

  const getStepStatus = (stepId: number) => {
    if (isStepComplete(stepId)) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (stepId === currentStep) {
      return <Clock className="h-5 w-5 text-accent animate-pulse" />;
    }
    return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100/30">
      {/* Header */}
      <div className="bg-white border-b border-emerald-100 sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/farmer/dashboard"
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm">Back to Dashboard</span>
            </Link>
            <h1 className="text-xl font-heading font-bold text-emerald-900">
              Farm Verification
            </h1>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-2 hover:bg-emerald-50 rounded-xl transition-colors"
            >
              <HelpCircle className="h-5 w-5 text-emerald-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Help Banner */}
          {showHelp && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-accent/10 border border-accent/20 rounded-2xl p-4"
            >
              <div className="flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-accent">
                    Need Help with Verification?
                  </h4>
                  <p className="text-sm text-emerald-700 mt-1">
                    Our support team is available to help. Contact us at
                    support@harvesthost.com or call +254 700 000 000.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Progress */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-semibold text-emerald-900">
                    Progress
                  </h2>
                  <span className="text-sm text-emerald-600">
                    {Math.round(progress)}%
                  </span>
                </div>

                <div className="h-2 bg-emerald-100 rounded-full overflow-hidden mb-6">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="space-y-4">
                  {verificationSteps.map((step) => (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStep(step.id)}
                      className={`w-full text-left p-4 rounded-xl transition-all ${
                        currentStep === step.id
                          ? "bg-emerald-50 border-l-4 border-accent"
                          : "hover:bg-emerald-50/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getStepStatus(step.id)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="text-emerald-500">
                              {getStepIcon(step.id)}
                            </div>
                            <h3
                              className={`font-medium ${currentStep === step.id ? "text-emerald-900" : "text-emerald-600"}`}
                            >
                              {step.name}
                            </h3>
                          </div>
                          <p className="text-xs text-emerald-500 mt-1">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Current Step Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
                {/* Step Header */}
                <div className="bg-emerald-50/50 px-6 py-4 border-b border-emerald-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-accent font-medium">
                        Step {currentStep} of 4
                      </span>
                      <h2 className="text-2xl font-heading font-bold text-emerald-900 mt-1">
                        {currentStepData?.name}
                      </h2>
                      <p className="text-emerald-600 mt-1">
                        {currentStepData?.description}
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-xl shadow-sm">
                      {currentStepData && (
                        <div className="text-accent">
                          {getStepIcon(currentStep)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Documents List */}
                <div className="p-6 space-y-4">
                  {currentDocs.map((doc) => {
                    const uploaded = uploadedDocs[doc.id];
                    const isUploaded = uploaded?.status === "uploaded";

                    return (
                      <div
                        key={doc.id}
                        className={`rounded-xl border p-5 transition-all ${
                          isUploaded
                            ? "border-green-200 bg-green-50/30"
                            : "border-emerald-100"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-emerald-500" />
                              <h3 className="font-semibold text-emerald-900">
                                {doc.name}
                              </h3>
                              {doc.required && (
                                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">
                                  Required
                                </span>
                              )}
                            </div>

                            {isUploaded && uploaded.file && (
                              <div className="mt-3 flex items-center gap-3 p-2 bg-white rounded-lg">
                                <FileText className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-emerald-700 flex-1">
                                  {uploaded.file.name}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="ml-4">
                            {isUploaded ? (
                              <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                <CheckCircle className="h-3 w-3" />
                                Uploaded
                              </span>
                            ) : (
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handleFileUpload(
                                        doc.id,
                                        e.target.files[0],
                                      );
                                    }
                                  }}
                                />
                                <div className="flex flex-col items-center gap-1 p-2 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors">
                                  <Upload className="h-5 w-5 text-emerald-500" />
                                  <span className="text-xs text-emerald-600">
                                    Upload
                                  </span>
                                </div>
                              </label>
                            )}
                          </div>
                        </div>

                        {/* Helpful Tips */}
                        {doc.id === "digital_search" && (
                          <div className="mt-3 p-2 bg-accent/5 rounded-lg text-xs text-emerald-600">
                            Get from Ardhisasa portal: Register → Add property →
                            Conduct Official Search (Ksh 500) → Download Form
                            LRA 85
                          </div>
                        )}
                        {doc.id === "beacon_certificate" && (
                          <div className="mt-3 p-2 bg-accent/5 rounded-lg text-xs text-emerald-600">
                            Contact Survey of Kenya for licensed surveyors to
                            verify your boundaries
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="bg-emerald-50/50 px-6 py-4 border-t border-emerald-100 flex justify-between">
                  <button
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-colors ${
                      currentStep === 1
                        ? "text-emerald-300 cursor-not-allowed"
                        : "text-emerald-600 hover:bg-emerald-100"
                    }`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                    Previous
                  </button>

                  {currentStep === 4 ? (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !isStepComplete(4)}
                      className={`flex items-center gap-2 px-6 py-2 bg-accent text-white rounded-xl font-medium transition-all ${
                        isSubmitting || !isStepComplete(4)
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-accent/90"
                      }`}
                    >
                      {isSubmitting ? "Submitting..." : "Submit for Review"}
                      <CheckCircle className="h-5 w-5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-6 py-2 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors"
                    >
                      Continue
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Status Message */}
              <div className="mt-4 text-center">
                <p className="text-sm text-emerald-500">
                  {isStepComplete(currentStep)
                    ? "✓ All required documents uploaded. Ready to continue!"
                    : "Please upload all required documents to proceed."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
