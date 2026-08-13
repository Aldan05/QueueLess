import InputField from './InputField';
import { Country, State, City } from 'country-state-city';

const Step2Location = ({ data, onChange }) => {
  const countries = Country.getAllCountries();
  const states = data.countryCode ? State.getStatesOfCountry(data.countryCode) : [];
  const districts = data.countryCode && data.stateCode ? City.getCitiesOfState(data.countryCode, data.stateCode) : [];

  const handleCountryChange = (e) => {
    const code = e.target.value;
    const name = countries.find(c => c.isoCode === code)?.name || '';
    onChange({
      countryCode: code,
      country: name,
      stateCode: '',
      state: '',
      district: ''
    });
  };

  const handleStateChange = (e) => {
    const code = e.target.value;
    const name = states.find(s => s.isoCode === code)?.name || '';
    onChange({
      stateCode: code,
      state: name,
      district: ''
    });
  };

  const handleDistrictChange = (e) => {
    onChange('district', e.target.value);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Business Location</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Country <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={data.countryCode || ''}
            onChange={handleCountryChange}
            className="block w-full px-4 py-3 border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white sm:text-sm rounded-xl transition-all duration-200 ease-in-out text-gray-900 appearance-none"
          >
            <option value="" disabled>Select Country</option>
            {countries.map(country => (
              <option key={country.isoCode} value={country.isoCode}>{country.name}</option>
            ))}
          </select>
        </div>

        {states.length > 0 ? (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              State <span className="text-red-500">*</span>
            </label>
            <select
              required
              disabled={!data.countryCode}
              value={data.stateCode || ''}
              onChange={handleStateChange}
              className="block w-full px-4 py-3 border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white sm:text-sm rounded-xl transition-all duration-200 ease-in-out text-gray-900 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="" disabled>Select State</option>
              {states.map(state => (
                <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
              ))}
            </select>
          </div>
        ) : (
          <InputField
            label="State"
            id="state"
            required
            value={data.state || ''}
            onChange={(e) => onChange('state', e.target.value)}
            placeholder="Enter State"
          />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {districts.length > 0 ? (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              District <span className="text-red-500">*</span>
            </label>
            <select
              required
              disabled={!data.stateCode && states.length > 0}
              value={data.district || ''}
              onChange={handleDistrictChange}
              className="block w-full px-4 py-3 border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white sm:text-sm rounded-xl transition-all duration-200 ease-in-out text-gray-900 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="" disabled>Select District</option>
              {districts.map(district => (
                <option key={district.name} value={district.name}>{district.name}</option>
              ))}
            </select>
          </div>
        ) : (
          <InputField
            label="District"
            id="district"
            required
            value={data.district || ''}
            onChange={(e) => onChange('district', e.target.value)}
            placeholder="Enter District"
          />
        )}
        <InputField
          label="City"
          id="city"
          required
          value={data.city || ''}
          onChange={(e) => onChange('city', e.target.value)}
          placeholder="e.g. Los Angeles"
        />
      </div>

      <InputField
        label="Full Address"
        id="address"
        type="textarea"
        required
        value={data.address || ''}
        onChange={(e) => onChange('address', e.target.value)}
        placeholder="123 Business Avenue, Suite 100"
      />

      <InputField
        label="PIN Code / Zip Code"
        id="pinCode"
        required
        value={data.pinCode || ''}
        onChange={(e) => onChange('pinCode', e.target.value)}
        placeholder="e.g. 90001"
      />
    </div>
  );
};

export default Step2Location;
