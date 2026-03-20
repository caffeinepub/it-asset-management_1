export interface Asset {
  id: string;
  name: string;
  category: "laptop" | "desktop" | "server" | "mobile" | "other";
  serialNumber: string;
  status: "available" | "assigned" | "in-audit" | "retired";
  purchaseDate: string;
  purchaseValue: number;
  vendor: string;
  location: string;
  notes: string;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  email: string;
  phone: string;
  joinDate: string;
  status: "active" | "onboarding" | "offboarding" | "inactive";
}

export interface Assignment {
  id: string;
  assetId: string;
  employeeId: string;
  assignedDate: string;
  returnedDate?: string;
  assignedBy: string;
  notes: string;
}

export interface OnboardingRecord {
  id: string;
  employeeId: string;
  joiningDate: string;
  status: "pending" | "in-progress" | "completed";
  checklistItems: { name: string; completed: boolean }[];
  notes: string;
}

export interface OffboardingRecord {
  id: string;
  employeeId: string;
  leavingDate: string;
  status: "pending" | "in-progress" | "completed";
  assetIds: string[];
  returnedAssetIds: string[];
  notes: string;
}

export interface AuditRecord {
  id: string;
  assetId: string;
  auditDate: string;
  auditedBy: string;
  condition: "good" | "fair" | "poor";
  notes: string;
  status: "pending" | "audited";
}

export type PageName =
  | "dashboard"
  | "inventory"
  | "employees"
  | "onboarding"
  | "audit"
  | "reports"
  | "admin";
