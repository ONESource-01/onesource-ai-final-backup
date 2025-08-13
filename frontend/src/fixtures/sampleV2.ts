// src/fixtures/sampleV2.ts
// Sample v2 API payload for e2e tests and development
export const sampleV2 = {
  title: "## 🛠 Technical Answer",
  summary: "Summary of acoustic lagging NCC requirements.",
  blocks: [
    { type: "markdown", content: "Here's an overview of compliance considerations." },
    {
      type: "table",
      caption: "NCC Clauses",
      headers: ["Clause", "Topic", "Applies To"],
      rows: [
        ["J1.3", "Acoustic lagging", "Class 2–9"],
        ["E1.5", "Fire safety systems", "High-rise"],
        ["F5.4", "Sound insulation", "Apartments"],
      ],
      dense: true
    },
    { type: "code", content: "R = 0.12 * ln(Ao/Ai)", language: "text" },
    { type: "list", content: "- Provide certification\n- Verify product datasheets" }
  ],
  meta: { emoji: "🧐", schema: "v2", mapped: true, schema_version: "2.0.0" }
} as const;

// Enhanced sample with more complex table and multiple sections
export const sampleV2Enhanced = {
  title: "## 🔧 **Technical Answer** - Fire Safety Requirements",
  summary: "Comprehensive fire safety requirements for high-rise buildings in Australia, covering detection systems, egress, and compliance with AS/NZS standards.",
  blocks: [
    { 
      type: "markdown", 
      content: "Fire safety in high-rise buildings requires compliance with multiple Australian Standards and the **National Construction Code (NCC)**. Key considerations include:" 
    },
    {
      type: "table",
      caption: "Fire Safety System Requirements",
      headers: ["System Type", "Standard", "Building Height", "Mandatory/Optional"],
      rows: [
        ["Smoke Detection", "AS 1670.1", "All heights", "Mandatory"],
        ["Sprinkler System", "AS 2118.1", ">25m effective height", "Mandatory"],
        ["Fire Alarm", "AS 1670.4", ">25m effective height", "Mandatory"],
        ["Emergency Lighting", "AS 2293.1", "All heights", "Mandatory"],
        ["Smoke Exhaust", "AS 1668.1", ">25m or Class 2-9", "Conditional"]
      ],
      dense: false
    },
    {
      type: "callout",
      content: "**Important:** Building heights are measured as 'effective height' under the NCC definition, not total building height."
    },
    {
      type: "code",
      content: "// Fire rating calculation example\nfire_rating_hours = Math.max(building_height_m / 25, 1);\nif (building_height_m > 75) {\n  fire_rating_hours = 4; // Maximum requirement\n}",
      language: "javascript"
    },
    {
      type: "list",
      content: "### Next Steps:\n- Engage fire engineer for performance solution\n- Submit fire safety strategy to building surveyor\n- Coordinate with MEP consultants\n- Verify product compliance certificates"
    }
  ],
  meta: { 
    emoji: "🔥", 
    schema: "v2", 
    mapped: true, 
    schema_version: "2.0.0",
    suggested_actions: [
      { label: "View AS 2118.1 requirements", payload: "standards:AS2118.1" },
      { label: "Calculate sprinkler coverage", payload: "calc:sprinkler_coverage" },
      { label: "Find fire engineer", payload: "directory:fire_engineers" }
    ]
  }
} as const;