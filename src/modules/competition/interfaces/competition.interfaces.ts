import {
  Cadence,
  ChallengeParameter,
  ChallengeType,
  MilestoneMetric,
  TargetMetric,
} from '../enums/competition.enums';

export interface Employee {
  id: string;
  name: string;
  role: string;
  avatar: string | null;
}

export interface Team {
  id: string;
  name: string;
  category: string;
  description: string | null;
  leaderId: string;
  memberIds: string[];
  icon: string;
  active: boolean;
  annualGoal?: number;
  createdAt: string;
}

export interface ScoringRules {
  lead: number;
  conversion: number;
  consistency: number;
  contribution: number;
  target: number;
  win: number;
}

export interface ChallengeTarget {
  metric: ChallengeParameter;
  target: number;
}

export interface Challenge {
  id: string;
  name: string;
  description: string | null;
  type: ChallengeType;
  cadence: Cadence;
  start: string;
  end: string;
  teamIds: string[];
  targets: ChallengeTarget[];
  rules: ScoringRules;
  archived: boolean;
  active: boolean;
  reward: string;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceRecord {
  employeeId: string;
  month: string;
  leads: number;
  converted: number;
  consistency: number;
  contribution: number;
  streak: number;
  revenue: number;
  tasks: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  metric: TargetMetric;
  target: number;
}

export interface Achievement {
  id: string;
  name: string;
  recipientId: string;
  date: string;
  description?: string;
  badgeId?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string | null;
  metric: MilestoneMetric;
  target: number;
  start: string;
  end: string;
  active: boolean;
}

export interface WinnerSnapshot {
  id: string;
  name: string;
  category?: string;
  team?: string;
  avatar?: string;
  leads: number;
  converted: number;
  rate: number;
  contribution: number;
  points: number;
  achievements: string[];
}

export interface MonthlyWinners {
  month: string;
  team?: WinnerSnapshot;
  individual?: WinnerSnapshot;
}

