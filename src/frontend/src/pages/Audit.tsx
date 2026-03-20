import { UserCheck, X } from "lucide-react";
import { useState } from "react";
import type { Asset, Assignment, AuditRecord, Employee } from "../types";

interface Props {
  assets: Asset[];
  employees: Employee[];
  assignments: Assignment[];
  auditRecords: AuditRecord[];
  setAuditRecords: React.Dispatch<React.SetStateAction<AuditRecord[]>>;
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
}

const conditionColors: Record<string, string> = {
  good: "bg-green-100 text-green-700",
  fair: "bg-amber-100 text-amber-700",
  poor: "bg-red-100 text-red-700",
};

export default function Audit({
  assets,
  employees,
  assignments,
  auditRecords,
  setAuditRecords,
  setAssets,
  setAssignments,
}: Props) {
  const [activeTab, setActiveTab] = useState<"pending" | "audited" | "history">(
    "pending",
  );
  const [auditAsset, setAuditAsset] = useState<Asset | null>(null);
  const [auditForm, setAuditForm] = useState({
    auditedBy: "",
    condition: "good" as AuditRecord["condition"],
    notes: "",
  });
  const [reassignAsset, setReassignAsset] = useState<Asset | null>(null);
  const [reassignEmployeeId, setReassignEmployeeId] = useState("");
  const [reassignNote, setReassignNote] = useState("");

  const auditedAssetIds = new Set(
    auditRecords.filter((r) => r.status === "audited").map((r) => r.assetId),
  );
  const pendingAuditAssets = assets.filter(
    (a) => !auditedAssetIds.has(a.id) && a.status !== "retired",
  );
  const auditedAssets = assets.filter((a) => auditedAssetIds.has(a.id));

  function getAssignedEmployee(assetId: string): Employee | undefined {
    const activeAssignment = assignments.find(
      (a) => a.assetId === assetId && !a.returnedDate,
    );
    if (!activeAssignment) return undefined;
    return employees.find((e) => e.id === activeAssignment.employeeId);
  }

  function submitAudit() {
    if (!auditAsset || !auditForm.auditedBy) return;
    const today = new Date().toISOString().split("T")[0];
    setAuditRecords((prev) => [
      ...prev.filter(
        (r) => !(r.assetId === auditAsset.id && r.status === "pending"),
      ),
      {
        id: `AU${Date.now()}`,
        assetId: auditAsset.id,
        auditDate: today,
        auditedBy: auditForm.auditedBy,
        condition: auditForm.condition,
        notes: auditForm.notes,
        status: "audited",
      },
    ]);
    setAssets((prev) =>
      prev.map((a) =>
        a.id === auditAsset.id
          ? { ...a, status: a.status === "in-audit" ? "available" : a.status }
          : a,
      ),
    );
    setAuditAsset(null);
    setAuditForm({ auditedBy: "", condition: "good", notes: "" });
  }

  function submitReassign() {
    if (!reassignAsset || !reassignEmployeeId) return;
    const today = new Date().toISOString().split("T")[0];
    setAssignments((prev) =>
      prev.map((a) =>
        a.assetId === reassignAsset.id && !a.returnedDate
          ? { ...a, returnedDate: today }
          : a,
      ),
    );
    const newAssignment: Assignment = {
      id: `AS${Date.now()}`,
      assetId: reassignAsset.id,
      employeeId: reassignEmployeeId,
      assignedDate: today,
      assignedBy: "Audit",
      notes: reassignNote || "Reassigned during audit",
    };
    setAssignments((prev) => [...prev, newAssignment]);
    setAssets((prev) =>
      prev.map((a) =>
        a.id === reassignAsset.id ? { ...a, status: "assigned" } : a,
      ),
    );
    setReassignAsset(null);
    setReassignEmployeeId("");
    setReassignNote("");
  }

  const tabs = [
    {
      id: "pending" as const,
      label: "Pending Inventory",
      count: pendingAuditAssets.length,
    },
    {
      id: "audited" as const,
      label: "Audited Inventory",
      count: auditedAssets.length,
    },
    {
      id: "history" as const,
      label: "Audit History",
      count: auditRecords.filter((r) => r.status === "audited").length,
    },
  ];

  const AssignedBadge = ({ assetId }: { assetId: string }) => {
    const emp = getAssignedEmployee(assetId);
    if (!emp) return <span className="text-gray-400 text-xs">Unassigned</span>;
    return (
      <span className="inline-flex items-center gap-1 text-gray-800 font-medium">
        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
          {emp.name.charAt(0)}
        </span>
        {emp.name}
      </span>
    );
  };

  const ReassignBtn = ({ asset }: { asset: Asset }) => (
    <button
      type="button"
      onClick={() => {
        setReassignAsset(asset);
        setReassignEmployeeId("");
        setReassignNote("");
      }}
      className="flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
    >
      <UserCheck size={12} />
      Reassign
    </button>
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Audit</h2>
        <p className="text-gray-500 text-sm mt-1">
          Track and manage inventory audits
        </p>
      </div>

      <div className="border-b border-gray-200">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Pending */}
      {activeTab === "pending" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[
                    "Asset ID",
                    "Name",
                    "Category",
                    "Status",
                    "Assigned To",
                    "Location",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendingAuditAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {asset.id}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {asset.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 capitalize">
                      {asset.category}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <AssignedBadge assetId={asset.id} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {asset.location}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAuditAsset(asset);
                            setAuditForm({
                              auditedBy: "",
                              condition: "good",
                              notes: "",
                            });
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        >
                          Start Audit
                        </button>
                        <ReassignBtn asset={asset} />
                      </div>
                    </td>
                  </tr>
                ))}
                {pendingAuditAssets.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      All assets have been audited
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audited */}
      {activeTab === "audited" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[
                    "Asset ID",
                    "Name",
                    "Category",
                    "Assigned To",
                    "Audit Date",
                    "Audited By",
                    "Condition",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {auditedAssets.map((asset) => {
                  const rec = auditRecords
                    .filter(
                      (r) => r.assetId === asset.id && r.status === "audited",
                    )
                    .sort(
                      (a, b) =>
                        new Date(b.auditDate).getTime() -
                        new Date(a.auditDate).getTime(),
                    )[0];
                  return (
                    <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        {asset.id}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {asset.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600 capitalize">
                        {asset.category}
                      </td>
                      <td className="px-4 py-3">
                        <AssignedBadge assetId={asset.id} />
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {rec?.auditDate || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {rec?.auditedBy || "-"}
                      </td>
                      <td className="px-4 py-3">
                        {rec && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${conditionColors[rec.condition]}`}
                          >
                            {rec.condition}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <ReassignBtn asset={asset} />
                      </td>
                    </tr>
                  );
                })}
                {auditedAssets.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      No audited assets yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History */}
      {activeTab === "history" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[
                    "Audit ID",
                    "Asset",
                    "Assigned To",
                    "Audit Date",
                    "Audited By",
                    "Condition",
                    "Notes",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[...auditRecords]
                  .filter((r) => r.status === "audited")
                  .sort(
                    (a, b) =>
                      new Date(b.auditDate).getTime() -
                      new Date(a.auditDate).getTime(),
                  )
                  .map((rec) => {
                    const asset = assets.find((a) => a.id === rec.assetId);
                    return (
                      <tr key={rec.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          {rec.id}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {asset?.name || rec.assetId}
                        </td>
                        <td className="px-4 py-3">
                          {asset ? (
                            <AssignedBadge assetId={asset.id} />
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {rec.auditDate}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {rec.auditedBy}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${conditionColors[rec.condition]}`}
                          >
                            {rec.condition}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {rec.notes || "-"}
                        </td>
                      </tr>
                    );
                  })}
                {auditRecords.filter((r) => r.status === "audited").length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      No audit history
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Form Modal */}
      {auditAsset && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">
                Audit: {auditAsset.name}
              </h3>
              <button
                type="button"
                onClick={() => setAuditAsset(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div>
                <label
                  htmlFor="auditedBy"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Audited By
                </label>
                <input
                  id="auditedBy"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={auditForm.auditedBy}
                  onChange={(e) =>
                    setAuditForm((p) => ({ ...p, auditedBy: e.target.value }))
                  }
                  placeholder="Your name"
                />
              </div>
              <div>
                <label
                  htmlFor="auditCondition"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Condition
                </label>
                <select
                  id="auditCondition"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={auditForm.condition}
                  onChange={(e) =>
                    setAuditForm((p) => ({
                      ...p,
                      condition: e.target.value as AuditRecord["condition"],
                    }))
                  }
                >
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="auditNotes"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Notes
                </label>
                <textarea
                  id="auditNotes"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={auditForm.notes}
                  onChange={(e) =>
                    setAuditForm((p) => ({ ...p, notes: e.target.value }))
                  }
                />
              </div>
              <button
                type="button"
                onClick={submitAudit}
                disabled={!auditForm.auditedBy}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-sm transition-colors"
              >
                Submit Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reassign Modal */}
      {reassignAsset && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Reassign: {reassignAsset.name}
                </h3>
                {(() => {
                  const cur = getAssignedEmployee(reassignAsset.id);
                  return cur ? (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Currently assigned to{" "}
                      <span className="font-medium text-gray-700">
                        {cur.name}
                      </span>
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Currently unassigned
                    </p>
                  );
                })()}
              </div>
              <button
                type="button"
                onClick={() => setReassignAsset(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div>
                <label
                  htmlFor="reassignEmployee"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Assign To
                </label>
                <select
                  id="reassignEmployee"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={reassignEmployeeId}
                  onChange={(e) => setReassignEmployeeId(e.target.value)}
                >
                  <option value="">Select employee...</option>
                  {employees
                    .filter(
                      (e) => e.status === "active" || e.status === "onboarding",
                    )
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} — {e.department}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="reassignNote"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Notes
                </label>
                <textarea
                  id="reassignNote"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={2}
                  placeholder="Reason for reassignment (optional)"
                  value={reassignNote}
                  onChange={(e) => setReassignNote(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={submitReassign}
                disabled={!reassignEmployeeId}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-sm transition-colors"
              >
                Confirm Reassignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
