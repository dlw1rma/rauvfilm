'use client';

import { useRef } from 'react';

interface DateInputProps {
  id?: string;
  name?: string;
  value: string; // "YYYY-MM-DD" or ""
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (e: any) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

/**
 * YYYY-MM-DD 포맷으로 표시되는 날짜 입력 컴포넌트
 * 네이티브 date picker를 사용하되, 표시 포맷을 통일
 */
export default function DateInput({
  id,
  name = '',
  value,
  onChange,
  required,
  className = '',
  placeholder = 'YYYY-MM-DD',
}: DateInputProps) {
  const hiddenRef = useRef<HTMLInputElement>(null);

  const displayValue = value || '';

  const handleClick = () => {
    if (hiddenRef.current?.showPicker) {
      hiddenRef.current.showPicker();
    } else {
      hiddenRef.current?.focus();
      hiddenRef.current?.click();
    }
  };

  return (
    <div className="relative">
      <input
        ref={hiddenRef}
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        tabIndex={-1}
        className="absolute inset-0 opacity-0 pointer-events-none"
        style={{ colorScheme: 'light' }}
      />
      <button
        type="button"
        id={id}
        onClick={handleClick}
        className={`w-full text-left ${className}`}
      >
        {displayValue ? (
          <span>{displayValue}</span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </button>
    </div>
  );
}
