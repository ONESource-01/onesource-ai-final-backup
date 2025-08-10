#!/usr/bin/env python3
"""
Debug ABN validation algorithm
"""
import sys
import re

def validate_abn_debug(abn: str) -> bool:
    """Validate Australian Business Number using official ATO algorithm with debug output"""
    print(f"\nDebugging ABN: '{abn}'")
    
    # Clean ABN (remove spaces, hyphens)
    clean_abn = re.sub(r'[^0-9]', '', abn)
    print(f"Cleaned ABN: '{clean_abn}'")
    
    # ABN should be 11 digits
    if len(clean_abn) != 11:
        print(f"❌ Length check failed: {len(clean_abn)} digits (expected 11)")
        return False
    
    # ABN checksum validation using official ATO algorithm
    try:
        # Convert to list of integers
        digits = [int(d) for d in clean_abn]
        print(f"Digits: {digits}")
        
        # Subtract 1 from the first digit
        digits[0] = digits[0] - 1
        print(f"After subtracting 1 from first digit: {digits}")
        
        # Official ATO weights for each position
        weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
        print(f"Weights: {weights}")
        
        # Calculate weighted sum
        products = [digit * weight for digit, weight in zip(digits, weights)]
        print(f"Products: {products}")
        
        weighted_sum = sum(products)
        print(f"Weighted sum: {weighted_sum}")
        
        # Valid ABN if sum is divisible by 89
        remainder = weighted_sum % 89
        print(f"Remainder when divided by 89: {remainder}")
        
        is_valid = remainder == 0
        print(f"Valid: {is_valid}")
        
        return is_valid
        
    except (ValueError, IndexError) as e:
        print(f"❌ Exception: {e}")
        return False

def main():
    """Test ABN validation with debug output"""
    test_abns = [
        "12 345 678 901",  # Previously failing
        "83 147 290 275",  # Known valid
        "51 824 753 556",  # Another known valid
        "33 102 417 032",  # Third known valid
        "12345678901",     # Without spaces
        "12-345-678-901",  # With hyphens
    ]
    
    for abn in test_abns:
        result = validate_abn_debug(abn)
        print(f"Final result for '{abn}': {'✅ VALID' if result else '❌ INVALID'}")
        print("-" * 50)

if __name__ == "__main__":
    main()