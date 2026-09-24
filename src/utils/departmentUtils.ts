import {
  Flame,
  ShieldCheck,
  HeartPulse,
  HardHat,
  LifeBuoy,
  Anchor,
  HeartHandshake,
  Radio,
  Users,
  Truck,
  Search,
  Building2,
  Shield,
  Flag,
  Compass,
  Sparkles,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';

export interface DepartmentTheme {
  name: string;
  shortName: string;
  icon: LucideIcon;
  color: string;
  bgLight: string;
  borderLight: string;
}

// Fallback palette for arbitrary future departments added by admin
const FALLBACK_PALETTE: Array<{ icon: LucideIcon; color: string; bgLight: string; borderLight: string }> = [
  { icon: Shield,        color: '#2563EB', bgLight: 'rgba(37, 99, 235, 0.1)',  borderLight: 'rgba(37, 99, 235, 0.25)' },
  { icon: Flame,         color: '#EF4444', bgLight: 'rgba(239, 68, 68, 0.1)',  borderLight: 'rgba(239, 68, 68, 0.25)' },
  { icon: HeartPulse,    color: '#10B981', bgLight: 'rgba(16, 185, 129, 0.1)', borderLight: 'rgba(16, 185, 129, 0.25)' },
  { icon: HardHat,       color: '#F59E0B', bgLight: 'rgba(245, 158, 11, 0.1)', borderLight: 'rgba(245, 158, 11, 0.25)' },
  { icon: LifeBuoy,      color: '#8B5CF6', bgLight: 'rgba(139, 92, 246, 0.1)', borderLight: 'rgba(139, 92, 246, 0.25)' },
  { icon: Anchor,        color: '#0284C7', bgLight: 'rgba(2, 132, 199, 0.1)',  borderLight: 'rgba(2, 132, 199, 0.25)' },
  { icon: HeartHandshake,color: '#EC4899', bgLight: 'rgba(236, 72, 153, 0.1)', borderLight: 'rgba(236, 72, 153, 0.25)' },
  { icon: Radio,         color: '#0D9488', bgLight: 'rgba(13, 148, 136, 0.1)', borderLight: 'rgba(13, 148, 136, 0.25)' },
  { icon: Users,         color: '#6366F1', bgLight: 'rgba(99, 102, 241, 0.1)', borderLight: 'rgba(99, 102, 241, 0.25)' },
  { icon: Building2,     color: '#475569', bgLight: 'rgba(71, 85, 105, 0.1)',  borderLight: 'rgba(71, 85, 105, 0.25)' },
  { icon: Flag,          color: '#D97706', bgLight: 'rgba(217, 119, 6, 0.1)',  borderLight: 'rgba(217, 119, 6, 0.25)' },
  { icon: Compass,       color: '#059669', bgLight: 'rgba(5, 150, 105, 0.1)',  borderLight: 'rgba(5, 150, 105, 0.25)' },
  { icon: Sparkles,      color: '#7C3AED', bgLight: 'rgba(124, 58, 237, 0.1)', borderLight: 'rgba(124, 58, 237, 0.25)' },
];

function stringHashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Resolves icon, color, and badge styles for any department name.
 * Handles known core units, semantic keyword matching, and deterministic hashing for any future departments added by admin.
 */
export function getDepartmentTheme(deptName?: string | null): DepartmentTheme {
  const raw = (deptName || '').trim();
  const normalized = raw.toUpperCase();

  // Core units
  if (normalized.includes('BFP') || normalized.includes('FIRE')) {
    return {
      name: raw || 'BFP (Bureau of Fire Protection)',
      shortName: 'BFP',
      icon: Flame,
      color: '#EF4444',
      bgLight: 'rgba(239, 68, 68, 0.1)',
      borderLight: 'rgba(239, 68, 68, 0.25)',
    };
  }

  if (normalized.includes('PNP') || normalized.includes('POLICE')) {
    return {
      name: raw || 'PNP (Philippine National Police)',
      shortName: 'PNP',
      icon: ShieldCheck,
      color: '#3B82F6',
      bgLight: 'rgba(59, 130, 246, 0.1)',
      borderLight: 'rgba(59, 130, 246, 0.25)',
    };
  }

  if (normalized.includes('MEDIC') || normalized.includes('HEALTH') || normalized.includes('HOSPITAL') || normalized.includes('EMS') || normalized.includes('AMBULANCE')) {
    return {
      name: raw || 'Medical / EMS',
      shortName: 'Medical',
      icon: HeartPulse,
      color: '#10B981',
      bgLight: 'rgba(16, 185, 129, 0.1)',
      borderLight: 'rgba(16, 185, 129, 0.25)',
    };
  }

  if (normalized.includes('ENGINEER') || normalized.includes('DPWH') || normalized.includes('WORKS') || normalized.includes('INFRA')) {
    return {
      name: raw || 'Engineering Office',
      shortName: 'Engineering',
      icon: HardHat,
      color: '#F59E0B',
      bgLight: 'rgba(245, 158, 11, 0.1)',
      borderLight: 'rgba(245, 158, 11, 0.25)',
    };
  }

  if (normalized.includes('RESCUE') || normalized.includes('MDRRMO') || normalized.includes('DISASTER') || normalized.includes('CDRRMO') || normalized.includes('PDRRMO')) {
    return {
      name: raw || 'MDRRMO Rescue',
      shortName: 'Rescue',
      icon: LifeBuoy,
      color: '#8B5CF6',
      bgLight: 'rgba(139, 92, 246, 0.1)',
      borderLight: 'rgba(139, 92, 246, 0.25)',
    };
  }

  // Semantic keywords for potential future admin departments
  if (normalized.includes('COAST') || normalized.includes('PCG') || normalized.includes('MARITIME') || normalized.includes('NAVY')) {
    return {
      name: raw,
      shortName: 'Coast Guard',
      icon: Anchor,
      color: '#0284C7',
      bgLight: 'rgba(2, 132, 199, 0.1)',
      borderLight: 'rgba(2, 132, 199, 0.25)',
    };
  }

  if (normalized.includes('DSWD') || normalized.includes('RELIEF') || normalized.includes('SOCIAL') || normalized.includes('CHARITY')) {
    return {
      name: raw,
      shortName: 'DSWD/Relief',
      icon: HeartHandshake,
      color: '#EC4899',
      bgLight: 'rgba(236, 72, 153, 0.1)',
      borderLight: 'rgba(236, 72, 153, 0.25)',
    };
  }

  if (normalized.includes('RADIO') || normalized.includes('COMM') || normalized.includes('TELECOM')) {
    return {
      name: raw,
      shortName: 'Communications',
      icon: Radio,
      color: '#0D9488',
      bgLight: 'rgba(139, 92, 246, 0.1)',
      borderLight: 'rgba(13, 148, 136, 0.25)',
    };
  }

  if (normalized.includes('BARANGAY') || normalized.includes('BRGY') || normalized.includes('TANOD') || normalized.includes('COMMUNITY')) {
    return {
      name: raw,
      shortName: 'Barangay',
      icon: Users,
      color: '#6366F1',
      bgLight: 'rgba(99, 102, 241, 0.1)',
      borderLight: 'rgba(99, 102, 241, 0.25)',
    };
  }

  if (normalized.includes('TRAFFIC') || normalized.includes('TRANSPORT') || normalized.includes('HIGHWAY') || normalized.includes('POSO')) {
    return {
      name: raw,
      shortName: 'Traffic/POSO',
      icon: Truck,
      color: '#F97316',
      bgLight: 'rgba(249, 115, 22, 0.1)',
      borderLight: 'rgba(249, 115, 22, 0.25)',
    };
  }

  if (normalized.includes('K9') || normalized.includes('DOG') || normalized.includes('SEARCH')) {
    return {
      name: raw,
      shortName: 'K9 Search',
      icon: Search,
      color: '#14B8A6',
      bgLight: 'rgba(20, 184, 166, 0.1)',
      borderLight: 'rgba(20, 184, 166, 0.25)',
    };
  }

  // Deterministic fallback for any unknown future department added by admin
  if (raw.length > 0) {
    const idx = stringHashCode(raw) % FALLBACK_PALETTE.length;
    const choice = FALLBACK_PALETTE[idx];
    return {
      name: raw,
      shortName: raw.length > 14 ? raw.slice(0, 12) + '…' : raw,
      icon: choice.icon,
      color: choice.color,
      bgLight: choice.bgLight,
      borderLight: choice.borderLight,
    };
  }

  // Generic fallback if empty
  return {
    name: 'Emergency Response Unit',
    shortName: 'Unit',
    icon: AlertCircle,
    color: '#2563EB',
    bgLight: 'rgba(37, 99, 235, 0.1)',
    borderLight: 'rgba(37, 99, 235, 0.25)',
  };
}
