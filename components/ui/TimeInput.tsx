'use client';

import { useRef } from 'react';

interface TimeInputProps {
  id?: string;
  name?: string;
  value: string; // "HH:MM" (24h) or ""
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (e: any) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

/**
 * HH:MM (24h) 값을 오전/오후 HH:MM 포맷으로 표시하는 시간 입력 컴포넌트
 * 네이티브 time picker를 사용하되, 표시 포맷을 통일
 */
export default function TimeInput({
  id,
  name = '',
  value,
  onChange,
  required,
  className = '',
  placeholder = '오전/오후 00:00',
}: TimeInputProps) {
  const hiddenRef = useRef<HTMLInputElement>(null);

  const formatTime12 = (time24: string): string => {
    if (!time24) return '';
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr || '00';
    const ampm = h < 12 ? '오전' : '오후';
    h = h % 12;
    if (h === 0) h = 12;
    return `${ampm} ${String(h).padStart(2, '0')}:${m}`;
  };

  const displayValue = formatTime12(value);

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
        type="time"
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
