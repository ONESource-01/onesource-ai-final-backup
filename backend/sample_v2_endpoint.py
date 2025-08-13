"""
Sample V2 API endpoint for testing ResponseRenderer components
Provides v2 schema responses for development and e2e testing
"""

from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter()

# Sample v2 responses for testing
SAMPLE_V2_BASIC = {
    "title": "## 🛠 **Technical Answer**",
    "summary": "Summary of acoustic lagging NCC requirements.",
    "blocks": [
        {"type": "markdown", "content": "Here's an overview of compliance considerations."},
        {
            "type": "table",
            "caption": "NCC Clauses",
            "headers": ["Clause", "Topic", "Applies To"],
            "rows": [
                ["J1.3", "Acoustic lagging", "Class 2–9"],
                ["E1.5", "Fire safety systems", "High-rise"],
                ["F5.4", "Sound insulation", "Apartments"],
            ],
            "dense": True
        },
        {"type": "code", "content": "R = 0.12 * ln(Ao/Ai)", "language": "text"},
        {"type": "list", "content": "- Provide certification\n- Verify product datasheets"}
    ],
    "meta": {"emoji": "🧐", "schema": "v2", "mapped": True, "schema_version": "2.0.0"}
}

SAMPLE_V2_ENHANCED = {
    "title": "## 🔧 **Technical Answer** - Fire Safety Requirements",
    "summary": "Comprehensive fire safety requirements for high-rise buildings in Australia, covering detection systems, egress, and compliance with AS/NZS standards.",
    "blocks": [
        {
            "type": "markdown",
            "content": "Fire safety in high-rise buildings requires compliance with multiple Australian Standards and the **National Construction Code (NCC)**. Key considerations include:"
        },
        {
            "type": "table",
            "caption": "Fire Safety System Requirements",
            "headers": ["System Type", "Standard", "Building Height", "Mandatory/Optional"],
            "rows": [
                ["Smoke Detection", "AS 1670.1", "All heights", "Mandatory"],
                ["Sprinkler System", "AS 2118.1", ">25m effective height", "Mandatory"],
                ["Fire Alarm", "AS 1670.4", ">25m effective height", "Mandatory"],
                ["Emergency Lighting", "AS 2293.1", "All heights", "Mandatory"],
                ["Smoke Exhaust", "AS 1668.1", ">25m or Class 2-9", "Conditional"]
            ],
            "dense": False
        },
        {
            "type": "callout",
            "content": "**Important:** Building heights are measured as 'effective height' under the NCC definition, not total building height."
        },
        {
            "type": "code",
            "content": "// Fire rating calculation example\nfire_rating_hours = Math.max(building_height_m / 25, 1);\nif (building_height_m > 75) {\n  fire_rating_hours = 4; // Maximum requirement\n}",
            "language": "javascript"
        },
        {
            "type": "list",
            "content": "### Next Steps:\n- Engage fire engineer for performance solution\n- Submit fire safety strategy to building surveyor\n- Coordinate with MEP consultants\n- Verify product compliance certificates"
        }
    ],
    "meta": {
        "emoji": "🔥",
        "schema": "v2",
        "mapped": True,
        "schema_version": "2.0.0",
        "suggested_actions": [
            {"label": "View AS 2118.1 requirements", "payload": "standards:AS2118.1"},
            {"label": "Calculate sprinkler coverage", "payload": "calc:sprinkler_coverage"},
            {"label": "Find fire engineer", "payload": "directory:fire_engineers"}
        ]
    }
}

@router.get("/api/sample/v2/basic")
async def get_sample_v2_basic() -> Dict[str, Any]:
    """Get basic v2 response sample for testing"""
    return SAMPLE_V2_BASIC

@router.get("/api/sample/v2/enhanced")
async def get_sample_v2_enhanced() -> Dict[str, Any]:
    """Get enhanced v2 response sample with complex table and actions"""
    return SAMPLE_V2_ENHANCED

@router.get("/api/sample/v2/table-test")
async def get_sample_v2_table_test() -> Dict[str, Any]:
    """Get v2 response focused on table rendering tests"""
    return {
        "title": "## 📊 **Table Rendering Tests**",
        "summary": "Comprehensive table rendering test with various data types and features.",
        "blocks": [
            {
                "type": "markdown",
                "content": "This response tests various table features including CSV export, mobile card-table, and accessibility."
            },
            {
                "type": "table",
                "caption": "Building Heights and Requirements",
                "headers": ["Building Type", "Height (m)", "Fire Rating (hrs)", "Sprinkler Required", "Notes"],
                "rows": [
                    ["Residential Low-rise", "12", "1", "No", "Standard residential"],
                    ["Residential Mid-rise", "25", "2", "Yes", "Effective height trigger"],
                    ["Commercial Office", "45", "3", "Yes", "AS 2118.1 applies"],
                    ["High-rise Mixed Use", "75", "4", "Yes", "Maximum fire rating"],
                    ["Super High-rise", "150", "4", "Yes", "Special performance solution"]
                ],
                "dense": False,
                "zebra": True,
                "stickyHeader": True,
                "allowCopy": True,
                "allowCsv": True
            },
            {
                "type": "callout",
                "content": "Use the **Copy** button to copy table data to clipboard, or **Export CSV** to download as a spreadsheet file."
            }
        ],
        "meta": {
            "emoji": "📊",
            "schema": "v2",
            "mapped": True,
            "schema_version": "2.0.0"
        }
    }