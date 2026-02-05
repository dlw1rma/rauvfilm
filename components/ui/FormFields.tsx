'use client';

import { forwardRef, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// ===== 공통 스타일 =====
const baseInputStyles = 'w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors';
const labelStyles = 'block text-sm font-medium mb-2';
const errorStyles = 'text-xs text-red-500 mt-1';
const hintStyles = 'text-xs text-muted-foreground mt-1';

// ===== Input =====
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, required, className, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className={labelStyles}>
            {label} {required && <span className="text-accent">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(baseInputStyles, error && 'border-red-500', className)}
          {...props}
        />
        {error && <p className={errorStyles}>{error}</p>}
        {hint && !error && <p className={hintStyles}>{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ===== Phone Input (자동 포맷팅) =====
interface PhoneInputProps extends Omit<InputProps, 'onChange'> {
  onChange?: (value: string) => void;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ onChange, ...props }, ref) => {
    const formatPhone = (value: string) => {
      const numbers = value.replace(/[^0-9]/g, '');
      if (numbers.length <= 3) return numbers;
      if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhone(e.target.value);
      if (onChange) {
        onChange(formatted);
      }
    };

    return (
      <Input
        ref={ref}
        type="tel"
        placeholder="010-1234-5678"
        onChange={handleChange}
        {...props}
      />
    );
  }
);
PhoneInput.displayName = 'PhoneInput';

// ===== Date Input (달력 팝업) =====
export const DateInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="date"
        onKeyDown={(e) => e.preventDefault()}
        onClick={(e) => {
          const input = e.currentTarget as HTMLInputElement;
          if (input.showPicker) {
            input.showPicker();
          }
        }}
        className={cn('cursor-pointer', className)}
        style={{ colorScheme: 'light' }}
        {...props}
      />
    );
  }
);
DateInput.displayName = 'DateInput';

// ===== Time Input (시간 선택) =====
export const TimeInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="time"
        onKeyDown={(e) => e.preventDefault()}
        onClick={(e) => {
          const input = e.currentTarget as HTMLInputElement;
          if (input.showPicker) {
            input.showPicker();
          }
        }}
        className={cn('cursor-pointer', className)}
        style={{ colorScheme: 'light' }}
        {...props}
      />
    );
  }
);
TimeInput.displayName = 'TimeInput';

// ===== Select =====
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, required, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className={labelStyles}>
            {label} {required && <span className="text-accent">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(baseInputStyles, error && 'border-red-500', className)}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className={errorStyles}>{error}</p>}
        {hint && !error && <p className={hintStyles}>{hint}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

// ===== Textarea =====
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, required, className, id, rows = 3, ...props }, ref) => {
    const textareaId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className={labelStyles}>
            {label} {required && <span className="text-accent">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={cn(baseInputStyles, 'resize-none', error && 'border-red-500', className)}
          {...props}
        />
        {error && <p className={errorStyles}>{error}</p>}
        {hint && !error && <p className={hintStyles}>{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// ===== Checkbox =====
interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className, disabled, ...props }, ref) => {
    return (
      <label className={cn('flex items-start gap-3 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed')}>
        <input
          ref={ref}
          type="checkbox"
          disabled={disabled}
          className={cn(
            'h-5 w-5 mt-0.5 rounded border-border bg-background text-accent focus:ring-accent',
            className
          )}
          {...props}
        />
        <div>
          <span className="text-sm">{label}</span>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';

// ===== Radio Group =====
interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  name: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  error?: string;
  required?: boolean;
  className?: string;
}

export function RadioGroup({
  name,
  label,
  value,
  onChange,
  options,
  error,
  required,
  className,
}: RadioGroupProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className={labelStyles}>
          {label} {required && <span className="text-accent">*</span>}
        </label>
      )}
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
              value === option.value
                ? 'border-accent bg-accent/5'
                : 'border-border hover:border-accent/50'
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="h-4 w-4 text-accent focus:ring-accent"
            />
            <div>
              <span className="text-sm font-medium">{option.label}</span>
              {option.description && (
                <p className="text-xs text-muted-foreground">{option.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>
      {error && <p className={errorStyles}>{error}</p>}
    </div>
  );
}

// ===== Form Section =====
interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, children, className }: FormSectionProps) {
  return (
    <div className={cn('bg-background rounded-xl border border-border p-6', className)}>
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

// ===== Form Grid =====
interface FormGridProps {
  cols?: 1 | 2 | 3;
  children: React.ReactNode;
  className?: string;
}

export function FormGrid({ cols = 2, children, className }: FormGridProps) {
  const colsClass = {
    1: 'grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <div className={cn('grid gap-4', colsClass[cols], className)}>
      {children}
    </div>
  );
}

// ===== Status Badge =====
interface StatusBadgeProps {
  status: string;
  label: string;
  colorClass?: string;
}

export function StatusBadge({ label, colorClass = 'bg-muted text-muted-foreground' }: StatusBadgeProps) {
  return (
    <span className={cn('px-2 py-1 rounded text-xs font-medium', colorClass)}>
      {label}
    </span>
  );
}

// ===== Button =====
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-accent text-white hover:bg-accent/90',
      secondary: 'bg-muted hover:bg-muted/80 text-foreground',
      danger: 'bg-red-500 text-white hover:bg-red-600',
      ghost: 'hover:bg-muted text-foreground',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            처리중...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';
