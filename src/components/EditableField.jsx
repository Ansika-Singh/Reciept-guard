/**
 * EditableField component with clear label, input styling, and accessibility
 */
export default function EditableField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  helperText = '',
  prefix = null,
  step = 'any',
}) {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
        <span>{label} {required && <span className="text-red-500">*</span>}</span>
      </label>

      <div className="relative rounded-lg shadow-sm">
        {prefix && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-500 font-medium sm:text-sm">{prefix}</span>
          </div>
        )}
        <input
          id={id}
          type={type}
          step={step}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`
            block w-full rounded-lg border border-gray-300 bg-white py-2 text-sm text-gray-900
            transition-smooth placeholder:text-gray-400
            focus:border-primary-mid focus:ring-2 focus:ring-primary-50 focus:outline-none
            ${prefix ? 'pl-8 pr-3' : 'px-3'}
          `}
        />
      </div>

      {helperText && (
        <p className="mt-1 text-xs text-muted">{helperText}</p>
      )}
    </div>
  );
}
