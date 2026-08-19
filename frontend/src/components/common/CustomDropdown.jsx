import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdExpandMore, MdCheck } from 'react-icons/md';

const CustomDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Select an option', 
  className = '',
  disabled = false,
  direction = 'down'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  
  // Format options: accept array of strings or array of {label, value}
  const formattedOptions = options.map(opt => 
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  const selectedOption = formattedOptions.find(opt => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update highlighted index when opening
  useEffect(() => {
    if (isOpen) {
      const index = formattedOptions.findIndex(opt => opt.value === value);
      setHighlightedIndex(index >= 0 ? index : 0);
    }
  }, [isOpen, value, formattedOptions]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
      if (!isOpen) {
        setIsOpen(true);
      } else if (highlightedIndex >= 0 && highlightedIndex < formattedOptions.length) {
        onChange(formattedOptions[highlightedIndex].value);
        setIsOpen(false);
      }
      e.preventDefault();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex(prev => Math.min(prev + 1, formattedOptions.length - 1));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex(prev => Math.max(prev - 1, 0));
      }
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const isUp = direction === 'up';

  return (
    <div 
      className={`relative w-full ${className}`} 
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
    >
      <button
        type="button"
        className={`w-full flex items-center justify-between px-3 py-1.5 min-h-[34px] md:min-h-[38px] bg-white border border-[#5cb85c] rounded-md text-sm font-medium transition-all duration-200 outline-none
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-[0_2px_8px_rgba(92,184,92,0.15)] focus:ring-2 focus:ring-[#5cb85c]/20'}
          ${isOpen ? 'ring-2 ring-[#5cb85c]/20 shadow-[0_2px_8px_rgba(92,184,92,0.15)]' : ''}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={`block truncate ${selectedOption ? 'text-gray-800' : 'text-gray-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? (isUp ? -180 : 180) : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className={`flex-shrink-0 ml-2 ${isOpen ? 'text-[#5cb85c]' : 'text-gray-400'}`}
        >
          <MdExpandMore className="text-xl md:text-2xl" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: isUp ? 10 : -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isUp ? 10 : -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`absolute z-[100] w-full ${isUp ? 'bottom-full mb-1.5' : 'mt-1.5'} bg-white border border-gray-100 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] overflow-hidden`}
          >
            <ul 
              className="max-h-60 overflow-y-auto py-1 custom-dropdown-scrollbar focus:outline-none overscroll-contain"
              role="listbox"
            >
              {formattedOptions.length === 0 ? (
                <li className="px-4 py-3 text-sm text-gray-500 text-center">No options</li>
              ) : (
                formattedOptions.map((opt, index) => {
                  const isSelected = value === opt.value;
                  const isHighlighted = highlightedIndex === index;
                  
                  return (
                    <li
                      key={opt.value}
                      role="option"
                      aria-selected={isSelected}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(opt.value);
                      }}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`relative flex items-center justify-between px-3 md:px-4 py-2.5 mx-1 my-0.5 rounded-lg text-sm cursor-pointer transition-colors duration-150
                        ${isSelected 
                          ? 'bg-[#5cb85c] text-[#FFF176] font-semibold' 
                          : isHighlighted 
                            ? 'bg-green-50 text-[#5cb85c] font-medium' 
                            : 'text-gray-700 hover:bg-green-50 hover:text-[#5cb85c]'}
                      `}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && (
                        <MdCheck className="text-lg ml-2 flex-shrink-0 text-[#FFF176]" />
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDropdown;
