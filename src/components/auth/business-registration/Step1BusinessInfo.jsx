import InputField from './InputField';

const categories = [
  'Hospital', 'Clinic', 'Bank', 'Restaurant', 'Salon',
  'Government Office', 'Diagnostic Center', 'Pharmacy', 'Service Center', 'Other'
];

const Step1BusinessInfo = ({ data, onChange }) => {
  return (
    <div className="space-y-5 animate-fadeIn">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Business Information</h3>
      
      <InputField
        label="Business Name"
        id="businessName"
        required
        value={data.businessName || ''}
        onChange={(e) => onChange('businessName', e.target.value)}
        placeholder="e.g. Acme Corporation"
      />

      <InputField
        label="Business Category"
        id="businessCategory"
        type="select"
        required
        options={categories}
        value={data.businessCategory || ''}
        onChange={(e) => onChange('businessCategory', e.target.value)}
      />

      <InputField
        label="Business Description"
        id="businessDescription"
        type="textarea"
        value={data.businessDescription || ''}
        onChange={(e) => onChange('businessDescription', e.target.value)}
        placeholder="Brief description of your services..."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <InputField
          label="Business Email"
          id="businessEmail"
          type="email"
          required
          value={data.businessEmail || ''}
          onChange={(e) => onChange('businessEmail', e.target.value)}
          placeholder="contact@business.com"
        />
        <InputField
          label="Business Phone Number"
          id="businessPhone"
          type="tel"
          required
          value={data.businessPhone || ''}
          onChange={(e) => onChange('businessPhone', e.target.value)}
          placeholder="+1 (555) 000-0000"
        />
      </div>

      <InputField
        label="Website (Optional)"
        id="website"
        type="url"
        value={data.website || ''}
        onChange={(e) => onChange('website', e.target.value)}
        placeholder="https://www.example.com"
      />
    </div>
  );
};

export default Step1BusinessInfo;
