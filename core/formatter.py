"""
Unified formatter - SINGLE SOURCE OF TRUTH for all formatting
Normalizes any model output into exact branded format
TIERS DO NOT CHANGE FORMATTING - only content depth
"""

import re
from typing import List, Dict, Tuple, Optional
from core.schema import CANONICAL_EMOJI_MAP, EmojiItem

class UnifiedFormatter:
    """
    Single formatter that applies ALL visual/emoji/table rules
    NO tier-specific formatting variations allowed
    """
    
    def __init__(self):
        self.section_patterns = self._build_section_patterns()
    
    def _build_section_patterns(self) -> Dict[str, re.Pattern]:
        """Build regex patterns for section detection and normalization"""
        patterns = {}
        
        # Match any variation of section headers and normalize to canonical
        for section_name, canonical_emoji in CANONICAL_EMOJI_MAP.items():
            # Match various emoji + title combinations
            pattern = rf"(?:^|\n)(?:[🔧🧐📋📊✅🔄🏛️📄⚙️❓🧠💡🤓]+)\s*\*?\*?{re.escape(section_name)}\*?\*?:?"
            patterns[section_name] = re.compile(pattern, re.IGNORECASE | re.MULTILINE)
        
        return patterns
    
    def format_response(self, raw_text: str) -> Tuple[str, List[EmojiItem]]:
        """
        Main formatting function - enforces ALL rules
        Returns: (formatted_text, emoji_map)
        """
        # Step 1: Normalize section headers with canonical emojis
        formatted_text = self._normalize_section_headers(raw_text)
        
        # Step 2: Apply typography rules  
        formatted_text = self._apply_typography_rules(formatted_text)
        
        # Step 3: Format lists with consistent styling
        formatted_text = self._normalize_lists(formatted_text)
        
        # Step 4: Convert markdown tables to professional HTML
        formatted_text = self._format_tables(formatted_text)
        
        # Step 5: Extract emoji map from formatted text
        emoji_map = self._extract_emoji_map(formatted_text)
        
        # Step 6: Final cleanup and validation
        formatted_text = self._final_cleanup(formatted_text)
        
        return formatted_text, emoji_map
    
    def _normalize_section_headers(self, text: str) -> str:
        """
        Enforce canonical emoji + header format
        Replace ANY variation with: ## {canonical_emoji} **{Title}**
        """
        formatted = text
        
        # CRITICAL: Replace wrong emojis with correct ones
        wrong_emoji_replacements = {
            "🧠 **Mentoring Insight**": "🧐 **Mentoring Insight**",
            "💡 **Mentoring Insight**": "🧐 **Mentoring Insight**", 
            "🤓 **Mentoring Insight**": "🧐 **Mentoring Insight**",
            "🧠 Mentoring Insight": "🧐 Mentoring Insight",
            "💡 Mentoring Insight": "🧐 Mentoring Insight",
            "🤓 Mentoring Insight": "🧐 Mentoring Insight"
        }
        
        for wrong, correct in wrong_emoji_replacements.items():
            formatted = formatted.replace(wrong, correct)
        
        # Normalize all section headers to H2 format
        for section_name, canonical_emoji in CANONICAL_EMOJI_MAP.items():
            # Find existing headers and normalize them
            pattern = rf"(?:^|\n)(?:#*\s*)?(?:[🔧🧐📋📊✅🔄🏛️📄⚙️❓🧠💡🤓]*)\s*\*?\*?{re.escape(section_name)}\*?\*?:?"
            replacement = f"\n\n## {canonical_emoji} **{section_name}**\n\n"
            formatted = re.sub(pattern, replacement, formatted, flags=re.IGNORECASE | re.MULTILINE)
        
        return formatted
    
    def _apply_typography_rules(self, text: str) -> str:
        """Apply consistent typography and spacing"""
        # Ensure proper spacing around sections
        text = re.sub(r'\n{3,}', '\n\n', text)  # Max 2 newlines
        
        # Ensure single space after section headers
        text = re.sub(r'(\*\*)\s*\n\s*', r'\1\n\n', text)
        
        # Fix paragraph spacing
        text = re.sub(r'\n([A-Z])', r'\n\n\1', text)
        
        return text.strip()
    
    def _normalize_lists(self, text: str) -> str:
        """Normalize all lists to consistent format"""
        # Convert various bullet styles to standard -
        text = re.sub(r'^[\s]*[•●○▸▪▫‣⁃]\s+', '- ', text, flags=re.MULTILINE)
        text = re.sub(r'^[\s]*[\*]\s+', '- ', text, flags=re.MULTILINE)
        
        # Normalize numbered lists
        text = re.sub(r'^[\s]*(\d+)[\.\)]\s+', r'\1. ', text, flags=re.MULTILINE)
        
        # Ensure proper indentation (single space before -)
        text = re.sub(r'^[\s]*-\s+', '- ', text, flags=re.MULTILINE)
        
        return text
    
    def _format_tables(self, text: str) -> str:
        """Convert markdown tables to professional HTML with ONESource styling"""
        # Detect markdown tables
        table_pattern = r'^\|(.+)\|\s*\n\|[-:\s|]+\|\s*\n((?:\|.+\|\s*\n?)+)'
        
        def table_replacer(match):
            header_row = match.group(1)
            body_rows = match.group(2)
            
            # Parse header
            headers = [h.strip() for h in header_row.split('|') if h.strip()]
            
            # Parse body rows
            rows = []
            for row_line in body_rows.strip().split('\n'):
                if row_line.strip():
                    cells = [cell.strip() for cell in row_line.split('|') if cell.strip()]
                    if cells:
                        rows.append(cells)
            
            # Generate professional HTML table
            html = '<div class="os-table-container">\n'
            html += '<table class="os-table">\n'
            
            # Header
            html += '<thead>\n<tr>\n'
            for header in headers:
                html += f'<th class="os-th">{header}</th>\n'
            html += '</tr>\n</thead>\n'
            
            # Body
            html += '<tbody>\n'
            for i, row in enumerate(rows):
                css_class = "os-tr-even" if i % 2 == 0 else "os-tr-odd"
                html += f'<tr class="{css_class}">\n'
                for cell in row:
                    html += f'<td class="os-td">{cell}</td>\n'
                html += '</tr>\n'
            html += '</tbody>\n'
            
            html += '</table>\n</div>\n'
            return html
        
        return re.sub(table_pattern, table_replacer, text, flags=re.MULTILINE)
    
    def _extract_emoji_map(self, text: str) -> List[EmojiItem]:
        """Extract emoji map from formatted text"""
        emoji_items = []
        
        for section_name, emoji_char in CANONICAL_EMOJI_MAP.items():
            if f"{emoji_char} **{section_name}**" in text:
                emoji_items.append(EmojiItem(
                    name=section_name.lower().replace(" ", "_"),
                    char=emoji_char
                ))
        
        # Ensure mentoring_insight is always present if any sections found
        if emoji_items and not any(item.name == "mentoring_insight" for item in emoji_items):
            emoji_items.append(EmojiItem(
                name="mentoring_insight",
                char="🧐"
            ))
        
        return emoji_items
    
    def _final_cleanup(self, text: str) -> str:
        """Final cleanup and validation"""
        # Remove excessive whitespace
        text = re.sub(r'\n{4,}', '\n\n\n', text)
        
        # Ensure proper ending
        text = text.strip()
        
        # Validate critical sections present
        if "🔧 **Technical Answer**" not in text:
            text = "## 🔧 **Technical Answer**\n\n" + text
        
        if "🧐 **Mentoring Insight**" not in text:
            text += "\n\n## 🧐 **Mentoring Insight**\n\nConsider professional consultation for project-specific guidance and compliance verification."
        
        if "📋 **Next Steps**" not in text:
            text += "\n\n## 📋 **Next Steps**\n\n1. Review relevant NCC provisions\n2. Engage appropriate specialists as needed\n3. Confirm compliance with local authority requirements"
        
        return text
    
    def extract_mentoring_insight(self, text: str) -> Optional[str]:
        """Extract mentoring insight section for separate field"""
        pattern = r"## 🧐 \*\*Mentoring Insight\*\*\n\n(.*?)(?=\n\n##|\Z)"
        match = re.search(pattern, text, re.DOTALL)
        if match:
            return match.group(1).strip()
        return None

# Global formatter instance
unified_formatter = UnifiedFormatter()