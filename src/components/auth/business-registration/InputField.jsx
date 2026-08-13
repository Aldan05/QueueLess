const InputField = ({ label, id, type = 'text', required = false, value, onChange, placeholder, options, className = '' }) => {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {type === 'select' ? (
        <select
          id={id}
          name={id}
          required={required}
          value={value}
          onChange={onChange}
          className="block w-full px-4 py-3 border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white sm:text-sm rounded-xl transition-all duration-200"
        >
          <option value="" disabled>Select {label}</option>
          {options?.map(opt => (
            <option key={opt.value || opt} value={opt.value || opt}>
              {opt.label || opt}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={id}
          name={id}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows="3"
          className="block w-full px-4 py-3 border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white sm:text-sm rounded-xl transition-all duration-200"
        ></textarea>
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="block w-full px-4 py-3 border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white sm:text-sm rounded-xl transition-all duration-200"
        />
      )}
    </div>
  );
};

export default InputField;
