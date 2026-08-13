import { FiCheck } from 'react-icons/fi';

const WizardStepper = ({ steps, currentStep }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        {/* Progress Bar Background */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
        
        {/* Active Progress Bar */}
        <div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500 ease-in-out"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors duration-300 ${
                  isCompleted 
                    ? 'bg-primary border-primary text-white' 
                    : isCurrent 
                      ? 'bg-white border-primary text-primary shadow-[0_0_0_4px_rgba(59,130,246,0.2)]'
                      : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {isCompleted ? <FiCheck className="w-4 h-4" /> : stepNumber}
              </div>
              <span className={`absolute top-10 text-xs font-semibold whitespace-nowrap hidden sm:block ${
                isCurrent ? 'text-primary' : isCompleted ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WizardStepper;
