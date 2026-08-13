import InputField from './InputField';

const Step5QueueSetup = ({ data, onChange }) => {
  return (
    <div className="space-y-5 animate-fadeIn">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Queue Setup</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <InputField
          label="Opening Time"
          id="openingTime"
          type="select"
          options={Array.from({ length: 48 }).map((_, i) => {
            const hour = Math.floor(i / 2);
            const min = i % 2 === 0 ? '00' : '30';
            const ampm = hour < 12 ? 'AM' : 'PM';
            const h12 = hour % 12 || 12;
            return `${h12}:${min} ${ampm}`;
          })}
          required
          value={data.openingTime || ''}
          onChange={(e) => onChange('openingTime', e.target.value)}
        />
        <InputField
          label="Closing Time"
          id="closingTime"
          type="select"
          options={Array.from({ length: 48 }).map((_, i) => {
            const hour = Math.floor(i / 2);
            const min = i % 2 === 0 ? '00' : '30';
            const ampm = hour < 12 ? 'AM' : 'PM';
            const h12 = hour % 12 || 12;
            return `${h12}:${min} ${ampm}`;
          })}
          required
          value={data.closingTime || ''}
          onChange={(e) => onChange('closingTime', e.target.value)}
        />
      </div>

      <InputField
        label="Working Days"
        id="workingDays"
        type="select"
        options={[
          'Everyday',
          'Monday - Friday',
          'Monday - Saturday',
          'Monday - Thursday',
          'Tuesday - Sunday',
          'Tuesday - Saturday',
          'Wednesday - Sunday',
          'Thursday - Monday',
          'Weekends Only (Sat-Sun)',
          'Monday, Wednesday, Friday',
          'Tuesday, Thursday, Saturday'
        ]}
        required
        value={data.workingDays || ''}
        onChange={(e) => onChange('workingDays', e.target.value)}
      />

      <div>
        <InputField
          label="Avg. Service Time (minutes)"
          id="avgServiceTime"
          type="number"
          required
          value={data.avgServiceTime || ''}
          onChange={(e) => onChange('avgServiceTime', e.target.value)}
          placeholder="e.g. 20"
        />
      </div>
    </div>
  );
};

export default Step5QueueSetup;
