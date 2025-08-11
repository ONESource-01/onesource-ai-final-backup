import React, { useState, useRef, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { X, Check, Search } from 'lucide-react';

const SmartAutoComplete = ({ 
  options = [], 
  selected = [], 
  onSelectionChange, 
  placeholder = "Type to search and select...",
  label = "Select Options",
  maxHeight = "200px",
  showCount = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Filter options based on search term and exclude already selected
  const filteredOptions = options.filter(option => {
    const optionText = typeof option === 'string' ? option : option.label || option.name || option;
    return optionText.toLowerCase().includes(searchTerm.toLowerCase()) && 
           !selected.some(selectedOption => {
             const selectedText = typeof selectedOption === 'string' ? selectedOption : selectedOption.label || selectedOption.name || selectedOption;
             return selectedText === optionText;
           });
  });

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            handleSelect(filteredOptions[highlightedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setHighlightedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, highlightedIndex, filteredOptions]);

  // Auto-scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = (option) => {
    const newSelection = [...selected, option];
    onSelectionChange(newSelection);
    setSearchTerm('');
    setHighlightedIndex(-1);
    // Keep input focused for multiple selections
    inputRef.current?.focus();
  };

  const handleRemove = (optionToRemove) => {
    const newSelection = selected.filter(option => {
      const optionText = typeof option === 'string' ? option : option.label || option.name || option;
      const removeText = typeof optionToRemove === 'string' ? optionToRemove : optionToRemove.label || optionToRemove.name || optionToRemove;
      return optionText !== removeText;
    });
    onSelectionChange(newSelection);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    // Delay closing to allow click events on options
    setTimeout(() => setIsOpen(false), 150);
  };

  const getOptionText = (option) => {
    return typeof option === 'string' ? option : option.label || option.name || option;
  };

  const getOptionDescription = (option) => {
    return typeof option === 'object' ? option.description : null;
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          {label} {showCount && selected.length > 0 && (
            <span className="text-gray-500">({selected.length} selected)</span>
          )}
        </label>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            className="pl-10 pr-4"
          />
          
          {/* Dropdown Options */}
          {isOpen && filteredOptions.length > 0 && (
            <div 
              className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
              style={{ maxHeight }}
            >
              <div 
                ref={listRef}
                className="overflow-y-auto py-1"
                style={{ maxHeight }}
              >
                {filteredOptions.map((option, index) => {
                  const optionText = getOptionText(option);
                  const optionDescription = getOptionDescription(option);
                  
                  return (
                    <button
                      key={optionText}
                      onClick={() => handleSelect(option)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-l-4 transition-colors ${
                        index === highlightedIndex 
                          ? 'bg-blue-50 border-l-blue-500' 
                          : 'border-l-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {optionText}
                          </p>
                          {optionDescription && (
                            <p className="text-xs text-gray-500 mt-1">
                              {optionDescription}
                            </p>
                          )}
                        </div>
                        {index === highlightedIndex && (
                          <Check className="h-4 w-4 text-blue-600 ml-2" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Results Message */}
          {isOpen && filteredOptions.length === 0 && searchTerm && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
              <p className="text-sm text-gray-500 text-center">
                No options found for "{searchTerm}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Tags */}
      {selected.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Selected:</p>
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-40 overflow-y-auto">
            {selected.map((option, index) => {
              const optionText = getOptionText(option);
              return (
                <Badge
                  key={`${optionText}-${index}`}
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 transition-colors"
                >
                  <span className="text-xs font-medium">{optionText}</span>
                  <button
                    onClick={() => handleRemove(option)}
                    className="hover:bg-blue-300 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {showCount && (
        <div className="flex justify-between text-xs text-gray-500">
          <span>{selected.length} selected</span>
          <span>{options.length - selected.length} available</span>
        </div>
      )}
    </div>
  );
};

export default SmartAutoComplete;