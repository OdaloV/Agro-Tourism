"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  HelpCircle,
  Upload,
  FileText,
  User,
  Landmark,
} from "lucide-react";

// Document type definition
interface DocumentType {
  id: string;
  name: string;
  required: boolean;
  icon: string;
  help?: string;
  options?: string[];
}

// Simplified verification steps
const verificationSteps = [
  {
    id: 1,
    name: "Identity Verification",
    description: "Confirm your identity as the farm owner",
    icon: User,
  },
  {
    id: 2,
    name: "Farm Documents",
    description: "Provide farm-related documents",
    icon: Landmark,
  },
];

// Simplified document requirements with proper typing
const stepDocuments: Record<number, DocumentType[]> = {
  1: [
    { id: "national_id", name: "National ID / Passport", required: true, icon: "🆔" },
    { id: "selfie_photo", name: "Selfie with ID", required: true, icon: "📸", help: "Take a clear selfie holding your ID" },
  ],
  2: [
    { 
      id: "ownership_proof", 
      name: "Proof of Ownership/Operation", 
      required: true, 
      icon: "📄",
      help: "Choose one of the options below",
      options: ["Title Deed", "Lease Agreement", "Land Owner Consent Letter"]
    },
    { 
      id: "business_document", 
      name: "Business Document", 
      required: false, 
      icon: "🏢",
      help: "Optional - If you have a registered business",
      options: ["Business Permit", "KRA PIN Certificate", "Certificate of Registration"]
    },
  ],
};

interface UploadedDoc {
  status: "pending" | "uploaded";
  file?: File;
  name?: string;
}

export default function FarmerVerificationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedDoc>>({});
  const [showHelp, setShowHelp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Get user ID from localStorage - only runs on client
  useEffect(() => {
    setMounted(true);
    
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserId(user.id);
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }
    
    // If no user data, redirect to login
    if (!userData) {
      router.push("/auth/login/farmer");
    }
  }, [router]);

  const currentStepData = verificationSteps.find((s) => s.id === currentStep);
  const currentDocs = stepDocuments[currentStep] || [];

  const isStepComplete = (stepId: number) => {
    const docs = stepDocuments[stepId] || [];
    const requiredDocs = docs.filter((d) => d.required);
    return requiredDocs.every((doc) => uploadedDocs[doc.id]?.status === "uploaded");
  };

  const handleFileUpload = (docId: string, file: File, docType?: string) => {
    setUploadedDocs((prev) => ({
      ...prev,
      [docId]: {
        status: "uploaded",
        file,
        name: file.name,
      },
    }));
    if (docType) {
      setSelectedDocType((prev) => ({ ...prev, [docId]: docType }));
    }
  };

  const handleNext = () => {
    if (currentStep < 2) {
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
const handleSubmit = async () => {
  setIsSubmitting(true);
  
  try {
    // Get user data from localStorage
    const userData = localStorage.getItem("userData");
    if (!userData) {
      throw new Error("User not logged in");
    }
    
    const user = JSON.parse(userData);
    
    // Prepare documents for submission
    const formData = new FormData();
    
    Object.entries(uploadedDocs).forEach(([docId, doc]) => {
      if (doc.file) {
        formData.append(docId, doc.file);
        if (selectedDocType[docId]) {
          formData.append(`${docId}_type`, selectedDocType[docId]);
        }
      }
    });
    
    formData.append("userId", user.id);
    
    const response = await fetch('/api/farmer/verification', {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Failed to submit documents");
    }
    
    // ✅ Send verification email after successful document submission
    if (data.sendVerificationEmail) {
      alert(`Documents submitted successfully! A verification email has been sent to ${user.email}. Please check your email and verify your account before logging in.`);
    } else {
      alert("Verification submitted! Our team will review your documents within 2-3 business days.");
    }
    
    // Store that verification email was sent
    localStorage.setItem("verificationEmailSent", "true");
    localStorage.setItem("pendingVerificationEmail", user.email);
    
    // Redirect to dashboard after successful submission
    router.push('/farmer/dashboard');
    
  } catch (error: any) {
    console.error("Submission error:", error);
    alert(error.message || "Failed to submit. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};
const resendVerificationEmail = async () => {
  try {
    const userData = localStorage.getItem("userData");
    if (!userData) return;
    
    const user = JSON.parse(userData);
    
    const response = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email })
    });
    
    if (response.ok) {
      alert("Verification email resent! Check your inbox.");
    } else {
      alert("Failed to resend. Please try again.");
    }
  } catch (error) {
    console.error("Error resending verification:", error);
  }
};

  const getStepIcon = (stepId: number) => {
    const step = verificationSteps.find((s) => s.id === stepId);
    if (!step) return null;
    const Icon = step.icon;
    return <Icon className="h-5 w-5" />;
  };

  // Don't render interactive elements until mounted on client
  if (!mounted || !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100/30">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/farmer/dashboard" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4">
            <ChevronRight className="h-5 w-5 rotate-180" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-heading font-bold text-emerald-900">Farm Verification</h1>
            <button onClick={() => setShowHelp(!showHelp)} className="p-2 hover:bg-emerald-50 rounded-xl">
              <HelpCircle className="h-5 w-5 text-emerald-500" />
            </button>
          </div>
        </div>

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
                <h4 className="font-semibold text-accent">Need Help?</h4>
                <p className="text-sm text-emerald-700 mt-1">
                  For small-scale farmers without formal registration, a Land Owner Consent Letter is accepted.
                  Contact us at support@harvesthost.com if you need assistance.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {verificationSteps.map((step) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  currentStep >= step.id ? "bg-accent text-emerald-900" : "bg-emerald-100 text-emerald-400"
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                {step.id < verificationSteps.length && (
                  <div className="flex-1 h-0.5 mx-2 bg-emerald-200">
                    <div 
                      className={`h-full bg-accent transition-all duration-500 ${
                        currentStep > step.id ? "w-full" : "w-0"
                      }`} 
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-md mx-auto mt-2">
            {verificationSteps.map((step) => (
              <div key={step.id} className="text-center flex-1">
                <p className="text-xs text-emerald-600">{step.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
          <div className="bg-emerald-50/50 px-6 py-4 border-b border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-accent font-medium">
                  Step {currentStep} of {verificationSteps.length}
                </span>
                <h2 className="text-2xl font-heading font-bold text-emerald-900 mt-1">
                  {currentStepData?.name}
                </h2>
                <p className="text-emerald-600 mt-1">{currentStepData?.description}</p>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-sm">
                {currentStepData && <div className="text-accent">{getStepIcon(currentStep)}</div>}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {currentDocs.map((doc) => {
              const uploaded = uploadedDocs[doc.id];
              const isUploaded = uploaded?.status === "uploaded";

              return (
                <div 
                  key={doc.id} 
                  className={`rounded-xl border p-5 transition-all ${
                    isUploaded ? "border-green-200 bg-green-50/30" : "border-emerald-100"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{doc.icon}</span>
                        <h3 className="font-semibold text-emerald-900">{doc.name}</h3>
                        {doc.required && (
                          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">
                            Required
                          </span>
                        )}
                        {!doc.required && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            Optional
                          </span>
                        )}
                      </div>
                      {doc.help && <p className="text-xs text-emerald-500 mt-1">{doc.help}</p>}

                      {/* Options dropdown for documents with options */}
                      {(doc.id === "ownership_proof" || doc.id === "business_document") && !isUploaded && doc.options && (
                        <div className="mt-3">
                          <select
                            value={selectedDocType[doc.id] || ""}
                            onChange={(e) => setSelectedDocType({ ...selectedDocType, [doc.id]: e.target.value })}
                            className="w-full md:w-64 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800 focus:outline-none focus:ring-2 focus:ring-accent/50"
                          >
                            <option value="">Select document type</option>
                            {doc.options.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {isUploaded && uploaded.file && (
                        <div className="mt-3 flex items-center gap-3 p-2 bg-white rounded-lg">
                          <FileText className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-emerald-700 flex-1 truncate">{uploaded.file.name}</span>
                          {selectedDocType[doc.id] && (
                            <span className="text-xs text-emerald-500 bg-emerald-100 px-2 py-0.5 rounded">
                              {selectedDocType[doc.id]}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="ml-4">
                      {isUploaded ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          <CheckCircle className="h-3 w-3" /> Uploaded
                        </span>
                      ) : (
                        <label className="cursor-pointer">
                          <input 
                            type="file" 
                            accept=".pdf,.jpg,.jpeg,.png" 
                            className="hidden" 
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                const docType = (doc.id === "ownership_proof" || doc.id === "business_document") 
                                  ? selectedDocType[doc.id] 
                                  : undefined;
                                handleFileUpload(doc.id, e.target.files[0], docType);
                              }
                            }} 
                          />
                          <div className="flex flex-col items-center gap-1 p-2 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors">
                            <Upload className="h-5 w-5 text-emerald-500" />
                            <span className="text-xs text-emerald-600">Upload</span>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-emerald-50/50 px-6 py-4 border-t border-emerald-100 flex justify-between">
            <button 
              onClick={handleBack} 
              disabled={currentStep === 1} 
              className="flex items-center gap-2 px-6 py-2 rounded-xl text-emerald-600 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="h-5 w-5 rotate-180" /> Previous
            </button>

            {currentStep === 2 ? (
              <button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !isStepComplete(2)} 
                className="flex items-center gap-2 px-6 py-2 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit for Review <CheckCircle className="h-5 w-5" />
                  </>
                )}
              </button>
            ) : (
              <button 
                onClick={handleNext} 
                disabled={!isStepComplete(1)} 
                className="flex items-center gap-2 px-6 py-2 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors"
              >
                Continue <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-emerald-600">
            {isStepComplete(currentStep) 
              ? "✓ Ready to continue!" 
              : "Please upload all required documents to proceed."}
          </p>
        </div>
        <div className="mt-6 text-center">
          <p className="text-xs text-emerald-400">
            Your documents are securely stored. For small-scale farmers, a Land Owner Consent Letter is accepted.
          </p>
        </div>
      </div>
    </div>
  );
}