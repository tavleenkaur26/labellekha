export const RULE_DETAILS = {
  'Rule 6(1)(a)': {
    clause: 'Rule 6(1)(a)',
    title: 'Manufacturer / Packer / Importer Details',
    isRule6: true,
    description: 'Mandatory declaration of the full name and complete address of the manufacturer, packer, or importer.',
  },
  'Rule 6(1)(b)': {
    clause: 'Rule 6(1)(b)',
    title: 'Common / Generic Name of Commodity',
    isRule6: true,
    description: 'Mandatory declaration of the common or generic name of the packaged commodity.',
  },
  'Rule 6(1)(c)': {
    clause: 'Rule 6(1)(c)',
    title: 'Net Quantity Declaration',
    isRule6: true,
    description: 'Declaration of net quantity in standard units of weight, measure, or number (e.g. g, ml, kg, pieces).',
  },
  'Rule 6(1)(d)': {
    clause: 'Rule 6(1)(d)',
    title: 'Month & Year of Manufacture / Packing',
    isRule6: true,
    description: 'Clear statement of the month and year in which the commodity is manufactured, packed, or imported.',
  },
  'Rule 6(1)(e)': {
    clause: 'Rule 6(1)(e)',
    title: 'Retail Sale Price (MRP)',
    isRule6: true,
    description: 'Maximum Retail Price (MRP) inclusive of all taxes, clearly stated with standard currency notation.',
  },
  'Rule 6(2)': {
    clause: 'Rule 6(2)',
    title: 'Consumer Complaint Contact',
    isRule6: true,
    description: 'Contact details (name, address, telephone number, email) for consumer grievance redressal.',
  },
  'Rule 7': {
    clause: 'Rule 7',
    title: 'Letter Height / Font Size Requirement',
    isRule6: false,
    description: 'Physical readability check for minimum letter height/font size per Table I/II. Evaluated separately from Rule 6 compliance score.',
  },
};

export const PRIORITY_CONFIG = {
  CRITICAL: { label: 'CRITICAL', color: 'var(--badge-fail-text)', bg: 'var(--badge-fail)' },
  HIGH: { label: 'HIGH', color: 'var(--badge-review-text)', bg: 'var(--badge-review)' },
  MEDIUM: { label: 'MEDIUM', color: '#93c5fd', bg: '#1e3a8a' },
  LOW: { label: 'LOW', color: '#94a3b8', bg: '#1e293b' },
};
