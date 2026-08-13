import BusinessRegistrationWizard from '../../components/auth/business-registration/BusinessRegistrationWizard';

const BusinessRegistration = () => {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 w-full">
        <BusinessRegistrationWizard />
      </div>
    </div>
  );
};

export default BusinessRegistration;
