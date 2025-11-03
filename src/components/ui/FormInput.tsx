interface FormInputProps {
    label: string;
    name: string;
    type?: string;
    placeholder?: string;
    className?: string;
    isTextarea?: boolean;
    rows?: number;
    isSelect?: boolean;
    selectOptions?: { value: string; label: string }[];
    value?: string;
    defaultValue?: string;
    onInputChange?: ((e: React.ChangeEvent<HTMLInputElement>) => void);
    required?: boolean;
    disabled?: boolean;
    minLength?: number;
    maxLength?: number;
}

export default function FormInput({
    label, name, type = "text", placeholder, className,
    required = false, disabled = false, minLength, maxLength,
    isTextarea = false, rows,
    isSelect = false, selectOptions = [], defaultValue,
    value, onInputChange,
}: FormInputProps) {
    return (
        <div className={`${className} form-input`}>
            <label htmlFor={name}>{label} {required && " *"}</label>
            {isSelect ? (
                <select name={name} id={name} defaultValue={defaultValue} required={required} disabled={disabled}>
                    {selectOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ) : isTextarea ? (
                <textarea name={name} id={name} placeholder={placeholder} required={required} rows={rows} disabled={disabled} />
            ) : (
                <input type={type} name={name} id={name} placeholder={placeholder}
                       minLength={minLength} maxLength={maxLength}
                       required={required} disabled={disabled}
                       {...(onInputChange ? { value, onChange: onInputChange } : { defaultValue })}
                />
            )}
        </div>
    );
}
