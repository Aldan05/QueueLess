import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDatabase } from '../../../context/DatabaseContext';
import WizardStepper from './WizardStepper';
import Step1BusinessInfo from './Step1BusinessInfo';
import Step2Location from './Step2Location';
import Step3OwnerInfo from './Step3OwnerInfo';
import Step4Documents from './Step4Documents';
import Step5QueueSetup from './Step5QueueSetup';
import Step6Credentials from './Step6Credentials';
import PendingVerification from './PendingVerification';

const steps = [
  { id: 1, title: 'Business Info' },
  { id: 2, title: 'Location' },
  { id: 3, title: 'Owner Info' },
  { id: 4, title: 'Documents' },
  { id: 5, title: 'Queue Setup' },
  { id: 6, title: 'Security' }
];

const BusinessRegistrationWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({});

  const handleInputChange = (field, value) => {
    if (typeof field === 'object') {
      setFormData(prev => ({ ...prev, ...field }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const { registerBusiness } = useDatabase();

  const handleSubmit = async () => {
    try {
      // Create new business and user via the context
      await registerBusiness(formData);
      
      setIsSubmitted(true);
    } catch (err) {
      alert(err.message || 'Failed to register business');
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
        <PendingVerification />
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          Business Onboarding
        </h2>
        <p className="text-sm text-gray-500 font-medium">
          Complete your profile to join QueueLess
        </p>
      </div>

      <WizardStepper steps={steps} currentStep={currentStep} />

      <div className="mt-8 mb-8 min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && <Step1BusinessInfo data={formData} onChange={handleInputChange} />}
            {currentStep === 2 && <Step2Location data={formData} onChange={handleInputChange} />}
            {currentStep === 3 && <Step3OwnerInfo data={formData} onChange={handleInputChange} />}
            {currentStep === 4 && <Step4Documents data={formData} onChange={handleInputChange} />}
            {currentStep === 5 && <Step5QueueSetup data={formData} onChange={handleInputChange} />}
            {currentStep === 6 && <Step6Credentials data={formData} onChange={handleInputChange} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <button
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="px-6 py-2.5 text-sm font-bold rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        {currentStep < 6 ? (
          <button
            onClick={handleNext}
            className="px-8 py-2.5 text-sm font-bold rounded-xl text-white bg-primary hover:bg-blue-600 shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] hover:-translate-y-0.5 transition-all duration-200"
          >
            Next Step
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-8 py-2.5 text-sm font-bold rounded-xl text-white bg-green-500 hover:bg-green-600 shadow-[0_4px_14px_0_rgba(34,197,94,0.39)] hover:shadow-[0_6px_20px_rgba(34,197,94,0.23)] hover:-translate-y-0.5 transition-all duration-200"
          >
            Submit Application
          </button>
        )}
      </div>
    </div>
  );
};

export default BusinessRegistrationWizard;
