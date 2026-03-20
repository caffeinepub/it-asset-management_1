import { useState } from "react";
import Layout from "./components/Layout";
import {
  sampleAssets,
  sampleAssignments,
  sampleAuditRecords,
  sampleEmployees,
  sampleOffboarding,
  sampleOnboarding,
} from "./data/sampleData";
import Admin from "./pages/Admin";
import Audit from "./pages/Audit";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Inventory from "./pages/Inventory";
import OnboardingOffboarding from "./pages/OnboardingOffboarding";
import Reports from "./pages/Reports";
import type {
  Asset,
  Assignment,
  AuditRecord,
  Employee,
  OffboardingRecord,
  OnboardingRecord,
  PageName,
} from "./types";

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageName>("dashboard");
  const [assets, setAssets] = useState<Asset[]>(sampleAssets);
  const [employees, setEmployees] = useState<Employee[]>(sampleEmployees);
  const [assignments, setAssignments] =
    useState<Assignment[]>(sampleAssignments);
  const [onboardingRecords, setOnboardingRecords] =
    useState<OnboardingRecord[]>(sampleOnboarding);
  const [offboardingRecords, setOffboardingRecords] =
    useState<OffboardingRecord[]>(sampleOffboarding);
  const [auditRecords, setAuditRecords] =
    useState<AuditRecord[]>(sampleAuditRecords);

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {currentPage === "dashboard" && (
        <Dashboard
          assets={assets}
          employees={employees}
          assignments={assignments}
          auditRecords={auditRecords}
          onboardingRecords={onboardingRecords}
          offboardingRecords={offboardingRecords}
        />
      )}
      {currentPage === "inventory" && (
        <Inventory
          assets={assets}
          employees={employees}
          assignments={assignments}
          setAssets={setAssets}
          setAssignments={setAssignments}
        />
      )}
      {currentPage === "employees" && (
        <Employees
          employees={employees}
          assets={assets}
          assignments={assignments}
          setEmployees={setEmployees}
        />
      )}
      {currentPage === "onboarding" && (
        <OnboardingOffboarding
          employees={employees}
          assets={assets}
          assignments={assignments}
          onboardingRecords={onboardingRecords}
          offboardingRecords={offboardingRecords}
          setOnboardingRecords={setOnboardingRecords}
          setOffboardingRecords={setOffboardingRecords}
        />
      )}
      {currentPage === "audit" && (
        <Audit
          assets={assets}
          employees={employees}
          assignments={assignments}
          auditRecords={auditRecords}
          setAuditRecords={setAuditRecords}
          setAssets={setAssets}
          setAssignments={setAssignments}
        />
      )}
      {currentPage === "reports" && (
        <Reports
          assets={assets}
          employees={employees}
          assignments={assignments}
          auditRecords={auditRecords}
        />
      )}
      {currentPage === "admin" && <Admin />}
    </Layout>
  );
}
