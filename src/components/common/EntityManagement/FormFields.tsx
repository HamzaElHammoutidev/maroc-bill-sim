import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

export interface FormFieldProps {
  /**
   * Label for the field
   */
  label: string;
  
  /**
   * ID for the input element (also used for htmlFor on label)
   */
  id: string;
  
  /**
   * Name attribute for form fields
   */
  name: string;
  
  /**
   * Whether the field is required
   */
  required?: boolean;
  
  /**
   * Additional class names for the field container
   */
  className?: string;
}

export interface TextFieldProps extends FormFieldProps {
  /**
   * Value of the input
   */
  value: string;
  
  /**
   * Input type (text, email, etc.)
   */
  type?: string;
  
  /**
   * Placeholder text
   */
  placeholder?: string;
  
  /**
   * Callback when value changes
   */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  
  /**
   * Whether the field is disabled
   */
  disabled?: boolean;
}

export interface SelectFieldProps extends FormFieldProps {
  /**
   * Current selected value
   */
  value: string;
  
  /**
   * Callback when value changes
   */
  onValueChange: (value: string) => void;
  
  /**
   * Placeholder text
   */
  placeholder?: string;
  
  /**
   * Select options
   */
  options: Array<{
    value: string;
    label: string;
  }>;
  
  /**
   * Whether the field is disabled
   */
  disabled?: boolean;
}

/**
 * A reusable text input field with label
 */
export const TextField: React.FC<TextFieldProps> = ({
  label,
  id,
  name,
  value,
  type = 'text',
  placeholder,
  onChange,
  required,
  disabled,
  className = 'space-y-2',
}) => {
  return (
    <div className={className}>
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
    </div>
  );
};

/**
 * A reusable select field with label
 */
export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  id,
  name,
  value,
  onValueChange,
  placeholder,
  options,
  required,
  disabled,
  className = 'space-y-2',
}) => {
  return (
    <div className={className}>
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};