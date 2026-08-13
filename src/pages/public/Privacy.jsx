import { motion } from 'framer-motion';

const Privacy = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-12 border-b border-gray-100 pb-12">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-500">Last updated: July 15, 2026</p>
          </div>

          <div className="space-y-8 text-gray-600 prose prose-blue max-w-none">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="leading-relaxed mb-4">
                We collect information to provide better services to all our users. The types of personal information we obtain include:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Contact details:</strong> Name, email address, and phone number.</li>
                <li><strong>Business information:</strong> Registration documents, business address, and operational hours (for business accounts).</li>
                <li><strong>Usage data:</strong> Information about how you interact with our Services, including device identifiers and IP addresses.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Data</h2>
              <p className="leading-relaxed">
                The information we collect is used in the following ways:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-4">
                <li>To facilitate the virtual queue and appointment system.</li>
                <li>To send SMS and email notifications regarding your queue status.</li>
                <li>To analyze platform usage and improve our matching algorithms.</li>
                <li>To verify business authenticity and prevent fraud.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Data Security</h2>
              <p className="leading-relaxed">
                QueueLess uses enterprise-grade encryption (TLS 1.3) in transit and AES-256 at rest. We maintain strict administrative, technical, and physical safeguards to protect your personal data against accidental or unlawful destruction, loss, alteration, and unauthorized disclosure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Cookies</h2>
              <p className="leading-relaxed">
                We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. User Rights</h2>
              <p className="leading-relaxed">
                Depending on your location, you may have rights under GDPR, CCPA, or other data protection laws to:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-4">
                <li>Access the personal data we hold about you.</li>
                <li>Request the deletion of your personal data.</li>
                <li>Opt-out of marketing communications.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact Information</h2>
              <p className="leading-relaxed">
                If you have any questions about this Privacy Policy, please contact our Data Protection Officer at:
              </p>
              <p className="font-bold text-gray-900 mt-2">privacy@queueless.com</p>
            </section>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Privacy;
