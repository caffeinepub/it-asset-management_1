import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  Asset,
  Assignment,
  AuditRecord,
  Employee,
  OffboardingRecord,
  OnboardingRecord,
} from "../types";

interface Props {
  assets: Asset[];
  employees: Employee[];
  assignments: Assignment[];
  auditRecords: AuditRecord[];
  onboardingRecords: OnboardingRecord[];
  offboardingRecords: OffboardingRecord[];
}

const COLORS = ["#2563eb", "#3b82f6", "#06b6d4", "#8b5cf6", "#94a3b8"];

export default function Dashboard({
  assets,
  employees,
  assignments,
  auditRecords,
  onboardingRecords,
  offboardingRecords,
}: Props) {
  const stats = useMemo(
    () => ({
      totalAssets: assets.length,
      assignedAssets: assets.filter((a) => a.status === "assigned").length,
      availableAssets: assets.filter((a) => a.status === "available").length,
      totalEmployees: employees.length,
      activeEmployees: employees.filter((e) => e.status === "active").length,
      pendingAudits: auditRecords.filter((a) => a.status === "pending").length,
      pendingOnboarding: onboardingRecords.filter(
        (o) => o.status !== "completed",
      ).length,
      pendingOffboarding: offboardingRecords.filter(
        (o) => o.status !== "completed",
      ).length,
    }),
    [assets, employees, auditRecords, onboardingRecords, offboardingRecords],
  );

  const employeeMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const e of employees) {
      map[e.id] = e.name;
    }
    return map;
  }, [employees]);

  const assetMap = useMemo(() => {
    const map: Record<string, Asset> = {};
    for (const a of assets) {
      map[a.id] = a;
    }
    return map;
  }, [assets]);

  // Active assignments (not returned)
  const activeAssignmentMap = useMemo(() => {
    const map: Record<string, string> = {}; // assetId -> employeeId
    for (const a of assignments) {
      if (!a.returnedDate) {
        map[a.assetId] = a.employeeId;
      }
    }
    return map;
  }, [assignments]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of assets) {
      counts[a.category] = (counts[a.category] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [assets]);

  const deptData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of employees) {
      counts[e.department] = (counts[e.department] || 0) + 1;
    }
    return Object.entries(counts).map(([dept, count]) => ({ dept, count }));
  }, [employees]);

  const monthlyData = [
    { month: "Jun", assigned: 4, returned: 1 },
    { month: "Jul", assigned: 6, returned: 2 },
    { month: "Aug", assigned: 3, returned: 3 },
    { month: "Sep", assigned: 7, returned: 1 },
    { month: "Oct", assigned: 5, returned: 2 },
    { month: "Nov", assigned: 4, returned: 3 },
  ];

  const recentAssignments = [...assignments]
    .sort(
      (a, b) =>
        new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime(),
    )
    .slice(0, 5);

  const inventoryOverview = useMemo(() => {
    return assets.slice(0, 10).map((asset) => {
      const empId = activeAssignmentMap[asset.id];
      return {
        ...asset,
        assignedTo: empId ? (employeeMap[empId] ?? "Unknown") : null,
      };
    });
  }, [assets, activeAssignmentMap, employeeMap]);

  const kpis = [
    {
      label: "Total Assets",
      value: stats.totalAssets,
      sub: `${stats.availableAssets} available`,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Assigned Assets",
      value: stats.assignedAssets,
      sub: `${stats.totalAssets - stats.assignedAssets} unassigned`,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Active Employees",
      value: stats.activeEmployees,
      sub: `${stats.totalEmployees} total`,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Pending Audits",
      value: stats.pendingAudits,
      sub: `${auditRecords.filter((a) => a.status === "audited").length} audited`,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">
          Overview of your IT assets and workforce
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
          >
            <div className={`inline-flex p-2 rounded-lg ${k.color} mb-3`}>
              <div className="w-4 h-4 rounded" />
            </div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
              {k.label}
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{k.value}</p>
            <p className="text-gray-400 text-xs mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">
            Asset Distribution by Category
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {categoryData.map((_, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: recharts Cell has no stable id
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Area Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">
            Monthly Asset Activity
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="assignedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="assigned"
                stroke="#2563eb"
                fill="url(#assignedGrad)"
                name="Assigned"
              />
              <Area
                type="monotone"
                dataKey="returned"
                stroke="#22c55e"
                fill="none"
                name="Returned"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart + Recent Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">
            Employees by Department
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="dept" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
                name="Employees"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">
            Recent Assignments
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-xs text-gray-500 font-medium">
                    Asset
                  </th>
                  <th className="text-left py-2 text-xs text-gray-500 font-medium">
                    Assigned To
                  </th>
                  <th className="text-left py-2 text-xs text-gray-500 font-medium">
                    Date
                  </th>
                  <th className="text-left py-2 text-xs text-gray-500 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentAssignments.map((a) => {
                  const asset = assetMap[a.assetId];
                  const empName = employeeMap[a.employeeId] ?? a.employeeId;
                  return (
                    <tr key={a.id} className="border-b border-gray-50">
                      <td className="py-2 text-gray-700 font-medium">
                        {asset ? asset.name : a.assetId}
                      </td>
                      <td className="py-2 text-gray-700">{empName}</td>
                      <td className="py-2 text-gray-500">{a.assignedDate}</td>
                      <td className="py-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            a.returnedDate
                              ? "bg-gray-100 text-gray-600"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {a.returnedDate ? "Returned" : "Active"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Inventory Overview with Assigned To */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Inventory Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">
                  Asset Name
                </th>
                <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">
                  Category
                </th>
                <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">
                  Serial No.
                </th>
                <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">
                  Status
                </th>
                <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">
                  Assigned To
                </th>
              </tr>
            </thead>
            <tbody>
              {inventoryOverview.map((asset) => (
                <tr
                  key={asset.id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td className="py-2 px-3 text-gray-700 font-medium">
                    {asset.name}
                  </td>
                  <td className="py-2 px-3 text-gray-500 capitalize">
                    {asset.category}
                  </td>
                  <td className="py-2 px-3 text-gray-500 font-mono text-xs">
                    {asset.serialNumber}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        asset.status === "assigned"
                          ? "bg-blue-100 text-blue-700"
                          : asset.status === "available"
                            ? "bg-green-100 text-green-700"
                            : asset.status === "in-audit"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {asset.status}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    {asset.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                          {asset.assignedTo.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-gray-700">
                          {asset.assignedTo}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Unassigned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {assets.length > 10 && (
          <p className="text-xs text-gray-400 mt-2 text-center">
            Showing 10 of {assets.length} assets. Go to Inventory for full list.
          </p>
        )}
      </div>
    </div>
  );
}
