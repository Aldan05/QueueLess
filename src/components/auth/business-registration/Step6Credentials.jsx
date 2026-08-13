import InputField from './InputField';

const Step6Credentials = ({ data, onChange }) => {
  return (
    <div className="space-y-5 animate-fadeIn">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Account Security</h3>

      <div className="mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
        <p className="text-sm text-blue-800 font-medium">
          Your account login email will be: <br/>
          <span className="font-bold text-lg">{data.email || data.businessEmail || data.ownerEmail || 'Your Email'}</span>
        </p>
      </div>

      <InputField
        label="Password"
        id="password"
        type="password"
        required
        value={data.password || ''}
        onChange={(e) => onChange('password', e.target.value)}
        placeholder="••••••••"
      />

      <InputField
        label="Confirm Password"
        id="confirmPassword"
        type="password"
        required
        value={data.confirmPassword || ''}
        onChange={(e) => onChange('confirmPassword', e.target.value)}
        placeholder="••••••••"
      />

      <div className="mt-6 flex items-start">
        <div className="flex items-center h-5">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            checked={data.terms || false}
            onChange={(e) => onChange('terms', e.target.checked)}
            className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded cursor-pointer transition-colors"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="terms" className="font-medium text-gray-700 cursor-pointer select-none">
            Accept Terms & Conditions
          </label>
          <p className="text-gray-500">I agree to the QueueLess terms and confirm all information is correct.</p>
        </div>
      </div>
    </div>
  );
};

export default Step6Credentials;
