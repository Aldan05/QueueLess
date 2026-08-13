import React, { useState, useEffect, useRef } from 'react';
import { FiClock } from 'react-icons/fi';

const TimeInput = ({ value, onChange, className }) => {
  // value is expected in 24-hr format "HH:MM" (e.g. "09:30", "14:15")
  const [hour, setHour] = useState('10');
  const [minute, setMinute] = useState('00');
  const [ampm, setAmpm] = useState('AM');
  const isEditingRef = useRef(false);
  const minuteRef = useRef(null);
  const hourRef = useRef(null);
  const hiddenTimePickerRef = useRef(null);

  // Sync from prop when value changes externally (and user is not currently typing)
  useEffect(() => {
    if (value && !isEditingRef.current) {
      const [h, m] = value.split(':');
      if (h !== undefined && m !== undefined) {
        let hInt = parseInt(h, 10);
        if (!isNaN(hInt)) {
          const newAmpm = hInt >= 12 ? 'PM' : 'AM';
          const newH12 = hInt % 12 || 12;
          setAmpm(newAmpm);
          setHour(newH12.toString());
          setMinute(m.toString().padStart(2, '0'));
        }
      }
    }
  }, [value]);

  const emitChange = (hVal, mVal, ampmVal) => {
    let hInt = parseInt(hVal, 10);
    if (isNaN(hInt) || hInt < 1) hInt = 12;
    if (hInt > 12) hInt = 12;

    let mInt = parseInt(mVal, 10);
    if (isNaN(mInt) || mInt < 0) mInt = 0;
    if (mInt > 59) mInt = 59;

    let h24 = hInt;
    if (ampmVal === 'PM' && h24 !== 12) h24 += 12;
    if (ampmVal === 'AM' && h24 === 12) h24 = 0;

    const hStr = h24.toString().padStart(2, '0');
    const mStr = mInt.toString().padStart(2, '0');
    onChange(`${hStr}:${mStr}`);
  };

  const handleHourChange = (e) => {
    isEditingRef.current = true;
    let raw = e.target.value.replace(/\D/g, '');
    
    if (raw.length > 2) raw = raw.slice(-2);

    let num = parseInt(raw, 10);

    if (raw === '') {
      setHour('');
      return;
    }

    if (num > 12) {
      raw = '12';
      num = 12;
    }

    setHour(raw);
    emitChange(raw, minute, ampm);

    // Auto-advance to minute field if 2 digits typed OR single digit >= 2
    if (raw.length === 2 || num >= 2) {
      setTimeout(() => minuteRef.current?.select(), 10);
    }
  };

  const handleHourBlur = () => {
    isEditingRef.current = false;
    let num = parseInt(hour, 10);
    let finalHour = '12';
    if (!isNaN(num) && num >= 1 && num <= 12) {
      finalHour = num.toString();
    }
    setHour(finalHour);
    emitChange(finalHour, minute, ampm);
  };

  const handleMinuteChange = (e) => {
    isEditingRef.current = true;
    let raw = e.target.value.replace(/\D/g, '');
    if (raw.length > 2) raw = raw.slice(-2);

    let num = parseInt(raw, 10);
    if (raw === '') {
      setMinute('');
      return;
    }

    if (num > 59) {
      raw = '59';
    }

    setMinute(raw);
    emitChange(hour, raw, ampm);
  };

  const handleMinuteBlur = () => {
    isEditingRef.current = false;
    let num = parseInt(minute, 10);
    let finalMinute = '00';
    if (!isNaN(num) && num >= 0 && num <= 59) {
      finalMinute = num.toString().padStart(2, '0');
    }
    setMinute(finalMinute);
    emitChange(hour, finalMinute, ampm);
  };

  const handleHourKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      let next = (parseInt(hour, 10) || 12) + 1;
      if (next > 12) next = 1;
      setHour(next.toString());
      emitChange(next.toString(), minute, ampm);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      let next = (parseInt(hour, 10) || 12) - 1;
      if (next < 1) next = 12;
      setHour(next.toString());
      emitChange(next.toString(), minute, ampm);
    } else if (e.key === 'ArrowRight' || e.key === ':') {
      e.preventDefault();
      minuteRef.current?.select();
    }
  };

  const handleMinuteKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      let next = (parseInt(minute, 10) || 0) + 5;
      if (next > 55) next = 0;
      const mStr = next.toString().padStart(2, '0');
      setMinute(mStr);
      emitChange(hour, mStr, ampm);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      let next = (parseInt(minute, 10) || 0) - 5;
      if (next < 0) next = 55;
      const mStr = next.toString().padStart(2, '0');
      setMinute(mStr);
      emitChange(hour, mStr, ampm);
    } else if (e.key === 'Backspace' && minute === '') {
      hourRef.current?.select();
    } else if (e.key === 'ArrowLeft') {
      if (e.target.selectionStart === 0) {
        hourRef.current?.select();
      }
    }
  };

  const setPeriod = (newAmpm) => {
    setAmpm(newAmpm);
    emitChange(hour, minute, newAmpm);
  };

  const handleNativePickerChange = (e) => {
    if (e.target.value) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={`relative flex items-center justify-between gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 transition-all shadow-sm ${className || ''}`}>
      {/* Time Digits */}
      <div className="flex items-center gap-1 font-mono">
        <input
          ref={hourRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={2}
          placeholder="10"
          value={hour}
          onChange={handleHourChange}
          onBlur={handleHourBlur}
          onKeyDown={handleHourKeyDown}
          onFocus={(e) => e.target.select()}
          className="w-8 text-center text-base font-bold bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg py-1 border border-gray-100 dark:border-slate-700 outline-none focus:bg-blue-50 dark:focus:bg-blue-950/40 focus:border-blue-400 transition-all"
        />
        <span className="text-gray-400 font-black text-lg select-none px-0.5">:</span>
        <input
          ref={minuteRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={2}
          placeholder="00"
          value={minute}
          onChange={handleMinuteChange}
          onBlur={handleMinuteBlur}
          onKeyDown={handleMinuteKeyDown}
          onFocus={(e) => e.target.select()}
          className="w-8 text-center text-base font-bold bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg py-1 border border-gray-100 dark:border-slate-700 outline-none focus:bg-blue-50 dark:focus:bg-blue-950/40 focus:border-blue-400 transition-all"
        />
      </div>

      {/* AM / PM Toggle Pill */}
      <div className="flex items-center bg-gray-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-gray-200/60 dark:border-slate-700/60">
        <button
          type="button"
          onClick={() => setPeriod('AM')}
          className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
            ampm === 'AM'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          AM
        </button>
        <button
          type="button"
          onClick={() => setPeriod('PM')}
          className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
            ampm === 'PM'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          PM
        </button>
      </div>

      {/* Clock Icon / Quick Native Picker */}
      <button
        type="button"
        title="Open Clock Picker"
        onClick={() => hiddenTimePickerRef.current?.showPicker?.()}
        className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
      >
        <FiClock className="w-4 h-4" />
      </button>

      {/* Hidden Native Time Input for system picker fallback */}
      <input
        ref={hiddenTimePickerRef}
        type="time"
        value={value || ''}
        onChange={handleNativePickerChange}
        className="sr-only"
        tabIndex={-1}
      />
    </div>
  );
};

export default TimeInput;
