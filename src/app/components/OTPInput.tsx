'use client';

import * as React from 'react';
import { OTPInput, SlotProps } from 'input-otp';
import { cn } from '@/lib/utils';

interface OTPFieldProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  disabled?: boolean;
}

export function PremiumOTPInput({ value, onChange, maxLength = 6, disabled }: OTPFieldProps) {
  return (
    <OTPInput
      maxLength={maxLength}
      value={value}
      onChange={onChange}
      disabled={disabled}
      containerClassName="group flex items-center gap-2 has-[:disabled]:opacity-50"
      render={({ slots }) => (
        <div className="flex gap-2">
          {slots.map((slot, idx) => (
            <Slot key={idx} {...slot} />
          ))}
        </div>
      )}
    />
  );
}

function Slot(props: SlotProps) {
  return (
    <div
      className={cn(
        'relative w-12 h-14 text-[2rem]',
        'flex items-center justify-center transition-all duration-300',
        'border-2 rounded-xl bg-white/5 border-white/10 text-foreground',
        'group-hover:border-white/20',
        props.isActive && 'border-primary ring-4 ring-primary/20 scale-105',
      )}
    >
      {props.char !== null && <div>{props.char}</div>}
      {props.hasFakeCaret && <FakeCaret />}
    </div>
  );
}

function FakeCaret() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="w-px h-8 bg-primary animate-caret-blink" />
    </div>
  );
}
