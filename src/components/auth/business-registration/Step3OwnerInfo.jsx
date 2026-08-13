import InputField from './InputField';

const designations = ['Owner', 'Manager', 'Authorized Representative'];

const Step3OwnerInfo = ({ data, onChange }) => {
  return (
    <div className="space-y-5 animate-fadeIn">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Owner Information</h3>

      <InputField
        label="Owner Full Name"
        id="ownerName"
        required
        value={data.ownerName || ''}
        onChange={(e) => onChange('ownerName', e.target.value)}
        placeholder="e.g. Jane Doe"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <InputField
          label="Owner Email"
          id="ownerEmail"
          type="email"
          required
          value={data.ownerEmail || ''}
          onChange={(e) => onChange('ownerEmail', e.target.value)}
          placeholder="owner@example.com"
        />
        <InputField
          label="Owner Mobile Number"
          id="ownerMobile"
          type="tel"
          required
          value={data.ownerMobile || ''}
          onChange={(e) => onChange('ownerMobile', e.target.value)}
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <InputField
        label="Designation"
        id="designation"
        type="select"
        options={designations}
        value={data.designation || ''}
        onChange={(e) => onChange('designation', e.target.value)}
      />
    </div>
  );
};

export default Step3OwnerInfo;
