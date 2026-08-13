import { motion } from 'framer-motion';

const Terms = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-12 border-b border-gray-100 pb-12">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              Terms of Service
            </h1>
            <p className="text-gray-500">Effective Date: July 15, 2026</p>
          </div>

          <div className="space-y-8 text-gray-600 prose prose-blue max-w-none">
            <p className="leading-relaxed">
              Welcome to QueueLess. By accessing or using our platform, you agree to be bound by these Terms of Service.
            </p>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. User Responsibilities</h2>
              <p className="leading-relaxed">
                As a customer using the platform, you agree to:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-4">
                <li>Provide accurate information when joining a queue or booking an appointment.</li>
                <li>Arrive at the business location promptly when your token is called.</li>
                <li>Not abuse the system by booking multiple simultaneous queues maliciously.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Business Responsibilities</h2>
              <p className="leading-relaxed">
                As a verified business using QueueLess, you agree to:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-4">
                <li>Provide legitimate registration documents during the onboarding process.</li>
                <li>Maintain accurate wait times and actively manage your digital queue.</li>
                <li>Treat customer data securely and not export it for unauthorized marketing purposes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Payment Terms</h2>
              <p className="leading-relaxed">
                For businesses on paid tiers (Professional, Enterprise), subscription fees are billed monthly or annually in advance. All fees are non-refundable unless otherwise required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cancellation Policy</h2>
              <p className="leading-relaxed">
                Businesses may cancel their subscription at any time through the Admin Dashboard. The cancellation will take effect at the end of the current billing cycle. Customers can delete their accounts at any time from their Profile settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Limitation of Liability</h2>
              <p className="leading-relaxed">
                QueueLess is not responsible for any direct, indirect, incidental, or consequential damages resulting from your use of the platform. We do not guarantee that businesses will honor the exact estimated wait times, as these are approximations based on real-time data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact Information</h2>
              <p className="leading-relaxed">
                For legal inquiries regarding these terms, please contact:
              </p>
              <p className="font-bold text-gray-900 mt-2">legal@queueless.com</p>
            </section>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Terms;
