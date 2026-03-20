import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import type { Asset, Assignment, AuditRecord, Employee } from "../types";

interface Props {
  assets: Asset[];
  employees: Employee[];
  assignments: Assignment[];
  auditRecords: AuditRecord[];
}

type ReportType = "inventory" | "employees" | "assignments" | "audits";

export default function Reports({
  assets,
  employees,
  assignments,
  auditRecords,
}: Props) {
  const [reportType, setReportType] = useState<ReportType>("inventory");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const departments = [...new Set(employees.map((e) => e.department))];

  const filteredData = useMemo(() => {
    switch (reportType) {
      case "inventory": {
        let data = [...assets];
        if (statusFilter !== "all")
          data = data.filter((a) => a.status === statusFilter);
        if (categoryFilter !== "all")
          data = data.filter((a) => a.category === categoryFilter);
        if (dateFrom) data = data.filter((a) => a.purchaseDate >= dateFrom);
        if (dateTo) data = data.filter((a) => a.purchaseDate <= dateTo);
        return data.map((a) => ({
          ID: a.id,
          Name: a.name,
          Category: a.category,
          "Serial #": a.serialNumber,
          Status: a.status,
          Location: a.location,
          Vendor: a.vendor,
          "Purchase Date": a.purchaseDate,
          "Value ($)": a.purchaseValue,
        }));
      }
      case "employees": {
        let data = [...employees];
        if (statusFilter !== "all")
          data = data.filter((e) => e.status === statusFilter);
        if (departmentFilter !== "all")
          data = data.filter((e) => e.department === departmentFilter);
        return data.map((e) => ({
          ID: e.id,
          Name: e.name,
          Department: e.department,
          Role: e.role,
          Email: e.email,
          Phone: e.phone,
          "Join Date": e.joinDate,
          Status: e.status,
        }));
      }
      case "assignments": {
        let data = [...assignments];
        if (statusFilter === "active")
          data = data.filter((a) => !a.returnedDate);
        if (statusFilter === "returned")
          data = data.filter((a) => !!a.returnedDate);
        if (dateFrom) data = data.filter((a) => a.assignedDate >= dateFrom);
        if (dateTo) data = data.filter((a) => a.assignedDate <= dateTo);
        return data.map((a) => {
          const asset = assets.find((x) => x.id === a.assetId);
          const emp = employees.find((x) => x.id === a.employeeId);
          return {
            ID: a.id,
            Asset: asset?.name || a.assetId,
            Employee: emp?.name || a.employeeId,
            "Assigned Date": a.assignedDate,
            "Returned Date": a.returnedDate || "Active",
            "Assigned By": a.assignedBy,
            Notes: a.notes,
          };
        });
      }
      case "audits": {
        let data = [...auditRecords];
        if (statusFilter !== "all")
          data = data.filter((r) => r.status === statusFilter);
        if (dateFrom) data = data.filter((r) => r.auditDate >= dateFrom);
        if (dateTo) data = data.filter((r) => r.auditDate <= dateTo);
        return data.map((r) => {
          const asset = assets.find((x) => x.id === r.assetId);
          return {
            ID: r.id,
            Asset: asset?.name || r.assetId,
            "Audit Date": r.auditDate,
            "Audited By": r.auditedBy,
            Condition: r.condition,
            Status: r.status,
            Notes: r.notes,
          };
        });
      }
      default:
        return [];
    }
  }, [
    reportType,
    statusFilter,
    categoryFilter,
    departmentFilter,
    dateFrom,
    dateTo,
    assets,
    employees,
    assignments,
    auditRecords,
  ]);

  function exportCSV() {
    if (filteredData.length === 0) return;
    const headers = Object.keys(filteredData[0]);
    const rows = filteredData.map((row) =>
      headers
        .map((h) => JSON.stringify((row as Record<string, unknown>)[h] ?? ""))
        .join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportJSON() {
    if (filteredData.length === 0) return;
    const blob = new Blob([JSON.stringify(filteredData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}-report.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const columns = filteredData.length > 0 ? Object.keys(filteredData[0]) : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
          <p className="text-gray-500 text-sm mt-1">
            Export data by various criteria
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={exportCSV}
            disabled={filteredData.length === 0}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Download size={16} /> Export CSV
          </button>
          <button
            type="button"
            onClick={exportJSON}
            disabled={filteredData.length === 0}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Download size={16} /> Export JSON
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm">
          Filter Criteria
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label
              htmlFor="reportType"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Report Type
            </label>
            <select
              id="reportType"
              className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value as ReportType);
                setStatusFilter("all");
              }}
            >
              <option value="inventory">Inventory</option>
              <option value="employees">Employees</option>
              <option value="assignments">Assignments</option>
              <option value="audits">Audits</option>
            </select>
          </div>

          {reportType === "inventory" && (
            <>
              <div>
                <label
                  htmlFor="invStatus"
                  className="block text-xs font-medium text-gray-600 mb-1"
                >
                  Status
                </label>
                <select
                  id="invStatus"
                  className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  {["available", "assigned", "in-audit", "retired"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="invCategory"
                  className="block text-xs font-medium text-gray-600 mb-1"
                >
                  Category
                </label>
                <select
                  id="invCategory"
                  className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  {["laptop", "desktop", "server", "mobile", "other"].map(
                    (c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </>
          )}

          {reportType === "employees" && (
            <>
              <div>
                <label
                  htmlFor="empStatus"
                  className="block text-xs font-medium text-gray-600 mb-1"
                >
                  Status
                </label>
                <select
                  id="empStatus"
                  className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  {["active", "onboarding", "offboarding", "inactive"].map(
                    (s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <div>
                <label
                  htmlFor="empDept"
                  className="block text-xs font-medium text-gray-600 mb-1"
                >
                  Department
                </label>
                <select
                  id="empDept"
                  className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {reportType === "assignments" && (
            <div>
              <label
                htmlFor="assignStatus"
                className="block text-xs font-medium text-gray-600 mb-1"
              >
                Status
              </label>
              <select
                id="assignStatus"
                className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="returned">Returned</option>
              </select>
            </div>
          )}

          {reportType === "audits" && (
            <div>
              <label
                htmlFor="auditStatus"
                className="block text-xs font-medium text-gray-600 mb-1"
              >
                Status
              </label>
              <select
                id="auditStatus"
                className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="audited">Audited</option>
              </select>
            </div>
          )}

          <div>
            <label
              htmlFor="dateFrom"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Date From
            </label>
            <input
              id="dateFrom"
              type="date"
              className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="dateTo"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Date To
            </label>
            <input
              id="dateTo"
              type="date"
              className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 text-sm">Preview</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {filteredData.length} records
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredData.slice(0, 20).map((row, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: report rows have no stable id
                <tr key={i} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td
                      key={col}
                      className="px-4 py-3 text-gray-700 whitespace-nowrap"
                    >
                      {String((row as Record<string, unknown>)[col] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length || 1}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    No data matches the selected filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredData.length > 20 && (
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400 text-center">
            Showing 20 of {filteredData.length} records. Export to see all data.
          </div>
        )}
      </div>
    </div>
  );
}
