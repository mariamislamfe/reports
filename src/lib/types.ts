export type Role = "admin" | "employee";
export type ReportRole = "observer" | "contractor";

export type FieldType = "text" | "textarea" | "number" | "date" | "select" | "checkbox";

export interface ViolationFieldDef {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // for "select"
  placeholder?: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  position: string | null;
  signature_path: string | null;
  signature_consent: boolean;
  role: Role;
  report_role: ReportRole | null;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  code: string | null;
  location: string | null;
  business_unit: string | null;
  contractor: string | null;
  sup_consultant: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ViolationType {
  id: string;
  name: string;
  description: string | null;
  fields: ViolationFieldDef[];
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * The report moves through the real 3-stage paper form's lifecycle:
 *   pending_contractor  → raised by an observer, waiting on the contractor
 *   pending_closeout    → contractor submitted their evidence, waiting on
 *                         an observer's final sign-off
 *   closed              → fully closed out
 */
export type ReportStatus = "pending_contractor" | "pending_closeout" | "closed";

export interface ProjectSnapshot {
  name: string;
  code: string | null;
  location: string | null;
  business_unit: string | null;
  contractor: string | null;
  sup_consultant: string | null;
}

export interface ViolationSnapshot {
  name: string;
  description: string | null;
  fields: ViolationFieldDef[];
}

export interface PersonSnapshot {
  full_name: string;
  position: string | null;
  signature_path: string | null;
}

/** @deprecated use PersonSnapshot */
export type EmployeeSnapshot = PersonSnapshot;

/**
 * Keys for the fixed fields that always appear on the HSE Observation Record
 * PDF, stored in `reports.field_values` alongside any extra per-violation
 * fields an admin configures. Extra fields (unknown keys) are rendered in a
 * generic appendix table so nothing entered is ever silently dropped.
 */
export const HSE_FIELD_KEYS = {
  OBSERVATION_DESCRIPTION: "observation_description",
  IMMEDIATE_ACTIONS: "immediate_actions",
  FURTHER_ACTIONS: "further_actions",
  COMPLETION_DATE: "completion_date",
} as const;

export interface Report {
  id: string;
  report_number: string;
  project_id: string | null;
  project_snapshot: ProjectSnapshot;
  violation_type_id: string | null;
  violation_snapshot: ViolationSnapshot;

  // Stage 1 — raised by an observer
  employee_id: string;
  employee_snapshot: PersonSnapshot;
  /** @deprecated use photo_paths */
  photo_path: string | null;
  photo_paths: string[];
  observation_location: string | null;
  field_values: Record<string, string | number | boolean>;
  notes: string | null;

  // Stage 2 — contractor close-out request
  contractor_description: string | null;
  /** @deprecated use contractor_photo_paths */
  contractor_photo_path: string | null;
  contractor_photo_paths: string[];
  contractor_snapshot: PersonSnapshot | null;
  contractor_submitted_at: string | null;

  // Stage 3 — observer final close-out
  closeout_comments: string | null;
  closeout_snapshot: PersonSnapshot | null;
  closeout_submitted_at: string | null;

  status: ReportStatus;
  created_at: string;
}
