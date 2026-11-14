import { LeadStatus } from 'generated/src/prisma/client';

export const ACTION_BASED_STATUSES: readonly LeadStatus[] = [
  LeadStatus.NEW,
  LeadStatus.OLD,
  LeadStatus.EMAIL_SENT,
  LeadStatus.DM_SENT,
  LeadStatus.COLD_CALL,
  LeadStatus.FOLLOWED_UP,
] as const;

export const RESULT_BASED_STATUSES: readonly LeadStatus[] = [
  LeadStatus.RESPONDED,
  LeadStatus.IGNORED,
  LeadStatus.CONVERTED,
] as const;

export type LeadStatusCategory = 'ACTION' | 'RESULT';

export function getLeadStatusCategory(status: LeadStatus): LeadStatusCategory {
  if (RESULT_BASED_STATUSES.includes(status)) {
    return 'RESULT';
  }
  return 'ACTION';
}

export function isActionBasedStatus(status: unknown): status is LeadStatus {
  return ACTION_BASED_STATUSES.includes(status as LeadStatus);
}

export function isResultBasedStatus(status: unknown): status is LeadStatus {
  return RESULT_BASED_STATUSES.includes(status as LeadStatus);
}

export const RECOMMENDED_OPPORTUNITY_OPTIONS = [
  'Website Development / Redesign',
  'SEO',
  'Meta Ads',
  'Google Ads',
  'Facebook Page Management',
  'Social Media Marketing',
  'Content Creation',
  'Branding & Design',
  'Lead Generation',
  'Conversion Optimization',
  'Marketing Automation',
  'Other',
] as const;

export type RecommendedOpportunityOption =
  (typeof RECOMMENDED_OPPORTUNITY_OPTIONS)[number];

export function mapLegacyStatus(status: string | undefined | null): LeadStatus | undefined {
  if (!status) return undefined;
  const upper = status.trim().toUpperCase();
  if (upper === 'DM') return LeadStatus.DM_SENT;
  if (upper === 'RESPOND') return LeadStatus.RESPONDED;
  if (upper === 'CONVERT') return LeadStatus.CONVERTED;
  if (Object.values(LeadStatus).includes(upper as LeadStatus)) {
    return upper as LeadStatus;
  }
  return undefined;
}

