export const POLICY_VERSIONS = {
  terms: "2026-07-08",
  privacy: "2026-07-08",
  communityStandards: "2026-07-08",
  adultAttestation: "2026-07-08",
} as const;

export type AccountStatus =
  | "onboarding"
  | "active"
  | "restricted"
  | "suspended"
  | "deletion_pending"
  | "deleted";

export type Account = {
  id: string;
  auth_user_id: string;
  email: string;
  status: AccountStatus;
  adult_attested_at: string | null;
  terms_version: string | null;
  privacy_version: string | null;
  community_standards_version: string | null;
  locale: string;
  time_zone: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};
