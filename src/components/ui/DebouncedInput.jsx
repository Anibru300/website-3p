import { useEffect, useRef } from 'react';

export default function DebouncedInput({ value, onChange, delay = 600, className = '', ...props }) {
  const inputRef = useRef(null);
  const syncedValueRef = useRef(value);
  const timeoutRef = useRef(null);

  // Sincroniza cambios externos sin setState en un effect.
  useEffect(() => {
    if (value !== syncedValueRef.current) {
      syncedValueRef.current = value;
      if (inputRef.current) inputRef.current.value = value;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      syncedValueRef.current = newValue;
      onChange(newValue);
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return <input ref={inputRef} {...props} defaultValue={value} onChange={handleChange} className={className} />;
}
