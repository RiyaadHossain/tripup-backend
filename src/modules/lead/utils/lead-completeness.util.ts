export interface LeadCompletenessInfo {
  percentage: number;
  totalFields: number;
  completedFields: number;
  filledFields: string[];
  missingFields: string[];
}

/**
 * Calculates lead completeness percentage based on the 11 relevant fields:
 * 1. Business Name
 * 2. Website
 * 3. Email
 * 4. Phone Number
 * 5. Location
 * 6. Facebook Page
 * 7. Business Niche
 * 8. Recommended Opportunity
 * 9. Strength
 * 10. Qualification
 * 11. Proposed Service
 */
export function calculateLeadCompleteness(lead: {
  businessName?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  facebookLink?: string | null;
  niche?: string | null;
  recommendedOpportunity?: string | null;
  strength?: number | null;
  qualification?: number | null;
  proposedService?: string | null;
}): LeadCompletenessInfo {
  const fields = [
    { key: 'businessName', label: 'Business Name', value: lead.businessName },
    { key: 'website', label: 'Website', value: lead.website },
    { key: 'email', label: 'Email', value: lead.email },
    { key: 'phone', label: 'Phone Number', value: lead.phone },
    { key: 'location', label: 'Location', value: lead.location },
    { key: 'facebookPage', label: 'Facebook Page', value: lead.facebookLink },
    { key: 'niche', label: 'Business Niche', value: lead.niche },
    {
      key: 'recommendedOpportunity',
      label: 'Recommended Opportunity',
      value: lead.recommendedOpportunity,
    },
    { key: 'strength', label: 'Strength', value: lead.strength },
    { key: 'qualification', label: 'Qualification', value: lead.qualification },
    {
      key: 'proposedService',
      label: 'Proposed Service',
      value: lead.proposedService,
    },
  ];

  const totalFields = fields.length;
  const filledFields: string[] = [];
  const missingFields: string[] = [];

  for (const field of fields) {
    const val = field.value;
    const isFilled =
      val !== null &&
      val !== undefined &&
      (typeof val === 'number'
        ? !Number.isNaN(val)
        : typeof val === 'string' && val.trim().length > 0);

    if (isFilled) {
      filledFields.push(field.key);
    } else {
      missingFields.push(field.key);
    }
  }

  const completedFields = filledFields.length;
  const percentage = Math.round((completedFields / totalFields) * 100);

  return {
    percentage,
    totalFields,
    completedFields,
    filledFields,
    missingFields,
  };
}

