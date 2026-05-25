'use client';

import { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Visual style variant */
  variant?: 'default' | 'minimal';
  /** Open menu above instead of below if true */
  menuPlacement?: 'bottom' | 'top';
  className?: string;
  buttonClassName?: string;
  /** Label for screen readers if no visible label */
  ariaLabel?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  disabled = false,
  variant = 'default',
  menuPlacement = 'bottom',
  className,
  buttonClassName,
  ariaLabel,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selected = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        !buttonRef.current?.contains(e.target as Node) &&
        !menuRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Reset highlight when opening
  useEffect(() => {
    if (open) {
      const currentIdx = options.findIndex((o) => o.value === value);
      setHighlightedIdx(currentIdx >= 0 ? currentIdx : 0);
    }
  }, [open, options, value]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!open) return;
    const el = menuRef.current?.querySelector<HTMLElement>(
      `[data-option-idx="${highlightedIdx}"]`
    );
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIdx, open]);

  function handleKey(e: React.KeyboardEvent) {
    if (disabled) return;

    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIdx((i) => {
          let next = i + 1;
          while (next < options.length && options[next]?.disabled) next++;
          return next >= options.length ? i : next;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIdx((i) => {
          let next = i - 1;
          while (next >= 0 && options[next]?.disabled) next--;
          return next < 0 ? i : next;
        });
        break;
      case 'Home':
        e.preventDefault();
        setHighlightedIdx(0);
        break;
      case 'End':
        e.preventDefault();
        setHighlightedIdx(options.length - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIdx >= 0 && !options[highlightedIdx]?.disabled) {
          onChange(options[highlightedIdx].value);
          setOpen(false);
          buttonRef.current?.focus();
        }
        break;
    }
  }

  return (
    <div className={cn('relative', className)}>
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={handleKey}
        className={cn(
          'flex items-center justify-between gap-2 w-full text-left transition-colors',
          variant === 'default'
            ? 'px-4 py-2.5 bg-cream border border-border hover:border-accent/50 focus:outline-none focus:border-accent text-sm'
            : 'pl-0 pr-6 py-3 bg-transparent border-0 border-b border-border focus:outline-none focus:border-accent text-sm',
          disabled && 'opacity-50 cursor-not-allowed',
          open && (variant === 'default' ? 'border-accent' : 'border-accent'),
          buttonClassName
        )}
      >
        <span
          className={cn(
            'truncate',
            !selected && 'text-muted-light'
          )}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            'shrink-0 text-muted transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            id={listboxId}
            role="listbox"
            initial={{ opacity: 0, y: menuPlacement === 'top' ? 6 : -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: menuPlacement === 'top' ? 6 : -6 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute left-0 right-0 z-50 bg-cream border border-accent shadow-medium max-h-72 overflow-y-auto scrollbar-thin',
              menuPlacement === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
            )}
          >
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-muted-light">No options</div>
            ) : (
              options.map((opt, idx) => {
                const isSelected = opt.value === value;
                const isHighlighted = idx === highlightedIdx;
                return (
                  <div
                    key={opt.value}
                    data-option-idx={idx}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={opt.disabled}
                    onClick={() => {
                      if (opt.disabled) return;
                      onChange(opt.value);
                      setOpen(false);
                      buttonRef.current?.focus();
                    }}
                    onMouseEnter={() => !opt.disabled && setHighlightedIdx(idx)}
                    className={cn(
                      'flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors',
                      opt.disabled
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer',
                      isHighlighted && !opt.disabled && 'bg-cream-200',
                      isSelected && 'text-accent font-medium'
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate">{opt.label}</div>
                      {opt.description && (
                        <div className="text-xs text-muted-light truncate mt-0.5">
                          {opt.description}
                        </div>
                      )}
                    </div>
                    {isSelected && <Check size={16} className="text-accent shrink-0" />}
                  </div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
