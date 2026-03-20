import {
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Plus,
  Square,
  X,
} from "lucide-react";
import { useState } from "react";
import type {
  Asset,
  Assignment,
  Employee,
  OffboardingRecord,
  OnboardingRecord,
} from "../types";

interface Props {
  employees: Employee[];
  assets: Asset[];
  assignments: Assignment[];
  onboardingRecords: OnboardingRecord[];
  offboardingRecords: OffboardingRecord[];
  setOnboardingRecords: React.Dispatch<
    React.SetStateAction<OnboardingRecord[]>
  >;
  setOffboardingRecords: React.Dispatch<
    React.SetStateAction<OffboardingRecord[]>
  >;
}

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
  "in-progress": "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
};

const defaultChecklist = [
  { name: "Issue laptop", completed: false },
  { name: "Setup email account", completed: false },
  { name: "Issue ID card", completed: false },
  { name: "IT orientation", completed: false },
  { name: "Systems access", completed: false },
];

export default function OnboardingOffboarding({
  employees,
  assets,
  assignments,
  onboardingRecords,
  offboardingRecords,
  setOnboardingRecords,
  setOffboardingRecords,
}: Props) {
  const [activeTab, setActiveTab] = useState<"onboarding" | "offboarding">(
    "onboarding",
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addOnOpen, setAddOnOpen] = useState(false);
  const [addOffOpen, setAddOffOpen] = useState(false);

  const [onForm, setOnForm] = useState({
    employeeId: "",
    joiningDate: "",
    notes: "",
  });
  const [offForm, setOffForm] = useState({
    employeeId: "",
    leavingDate: "",
    notes: "",
  });

  const Modal = ({
    title,
    onClose,
    children,
  }: { title: string; onClose: () => void; children: React.ReactNode }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );

  function addOnboarding() {
    if (!onForm.employeeId || !onForm.joiningDate) return;
    setOnboardingRecords((prev) => [
      ...prev,
      {
        id: `ON${Date.now()}`,
        employeeId: onForm.employeeId,
        joiningDate: onForm.joiningDate,
        status: "pending",
        checklistItems: defaultChecklist.map((i) => ({ ...i })),
        notes: onForm.notes,
      },
    ]);
    setOnForm({ employeeId: "", joiningDate: "", notes: "" });
    setAddOnOpen(false);
  }

  function addOffboarding() {
    if (!offForm.employeeId || !offForm.leavingDate) return;
    const empAssets = assignments
      .filter((a) => a.employeeId === offForm.employeeId && !a.returnedDate)
      .map((a) => a.assetId);
    setOffboardingRecords((prev) => [
      ...prev,
      {
        id: `OFF${Date.now()}`,
        employeeId: offForm.employeeId,
        leavingDate: offForm.leavingDate,
        status: "pending",
        assetIds: empAssets,
        returnedAssetIds: [],
        notes: offForm.notes,
      },
    ]);
    setOffForm({ employeeId: "", leavingDate: "", notes: "" });
    setAddOffOpen(false);
  }

  function toggleChecklist(recordId: string, idx: number) {
    setOnboardingRecords((prev) =>
      prev.map((r) => {
        if (r.id !== recordId) return r;
        const items = r.checklistItems.map((item, i) =>
          i === idx ? { ...item, completed: !item.completed } : item,
        );
        const allDone = items.every((i) => i.completed);
        return {
          ...r,
          checklistItems: items,
          status: allDone
            ? "completed"
            : items.some((i) => i.completed)
              ? "in-progress"
              : "pending",
        };
      }),
    );
  }

  function toggleReturnedAsset(recordId: string, assetId: string) {
    setOffboardingRecords((prev) =>
      prev.map((r) => {
        if (r.id !== recordId) return r;
        const returned = r.returnedAssetIds.includes(assetId)
          ? r.returnedAssetIds.filter((id) => id !== assetId)
          : [...r.returnedAssetIds, assetId];
        const allReturned = r.assetIds.every((id) => returned.includes(id));
        return {
          ...r,
          returnedAssetIds: returned,
          status:
            allReturned && r.assetIds.length > 0
              ? "completed"
              : returned.length > 0
                ? "in-progress"
                : "pending",
        };
      }),
    );
  }

  const empName = (id: string) =>
    employees.find((e) => e.id === id)?.name || id;
  const assetName = (id: string) => assets.find((a) => a.id === id)?.name || id;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Onboarding & Offboarding
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Manage employee transitions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(["onboarding", "offboarding"] as const).map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Onboarding Tab */}
      {activeTab === "onboarding" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setAddOnOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} /> Add Onboarding
            </button>
          </div>
          <div className="space-y-3">
            {onboardingRecords.map((rec) => {
              const done = rec.checklistItems.filter((i) => i.completed).length;
              const total = rec.checklistItems.length;
              const isExpanded = expandedId === rec.id;
              return (
                <div
                  key={rec.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 text-left"
                    onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                        {empName(rec.employeeId).charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {empName(rec.employeeId)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Joining: {rec.joiningDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{
                              width: `${total ? (done / total) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {done}/{total}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[rec.status]}`}
                      >
                        {rec.status}
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-400" />
                      )}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mt-3 mb-2 font-semibold uppercase tracking-wide">
                        Checklist
                      </p>
                      <div className="space-y-2">
                        {rec.checklistItems.map((item, idx) => (
                          <button
                            type="button"
                            // biome-ignore lint/suspicious/noArrayIndexKey: checklist items have no stable id
                            key={idx}
                            onClick={() => toggleChecklist(rec.id, idx)}
                            className="flex items-center gap-2 w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                          >
                            {item.completed ? (
                              <CheckSquare
                                size={16}
                                className="text-green-600"
                              />
                            ) : (
                              <Square size={16} className="text-gray-400" />
                            )}
                            <span
                              className={`text-sm ${item.completed ? "line-through text-gray-400" : "text-gray-700"}`}
                            >
                              {item.name}
                            </span>
                          </button>
                        ))}
                      </div>
                      {rec.notes && (
                        <p className="mt-3 text-xs text-gray-400">
                          Note: {rec.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {onboardingRecords.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
                No onboarding records
              </div>
            )}
          </div>
        </div>
      )}

      {/* Offboarding Tab */}
      {activeTab === "offboarding" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setAddOffOpen(true)}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} /> Add Offboarding
            </button>
          </div>
          <div className="space-y-3">
            {offboardingRecords.map((rec) => {
              const emp = employees.find((e) => e.id === rec.employeeId);
              const isExpanded = expandedId === rec.id;
              return (
                <div
                  key={rec.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 text-left"
                    onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm">
                        {(emp?.name || "U").charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {emp?.name || rec.employeeId}
                        </p>
                        <p className="text-xs text-gray-500">
                          Leaving: {rec.leavingDate} &bull; {emp?.department}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="hidden sm:inline text-xs text-gray-500">
                        {rec.returnedAssetIds.length}/{rec.assetIds.length}{" "}
                        assets returned
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[rec.status]}`}
                      >
                        {rec.status}
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-400" />
                      )}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-4 mt-3 mb-3 text-sm">
                        <div>
                          <span className="text-gray-500">Role:</span>{" "}
                          <span className="text-gray-800">{emp?.role}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Email:</span>{" "}
                          <span className="text-gray-800">{emp?.email}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">
                        Assets to Return
                      </p>
                      {rec.assetIds.length === 0 ? (
                        <p className="text-sm text-gray-400">
                          No assets assigned to this employee.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {rec.assetIds.map((assetId) => (
                            <button
                              type="button"
                              key={assetId}
                              onClick={() =>
                                toggleReturnedAsset(rec.id, assetId)
                              }
                              className="flex items-center gap-2 w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                            >
                              {rec.returnedAssetIds.includes(assetId) ? (
                                <CheckSquare
                                  size={16}
                                  className="text-green-600"
                                />
                              ) : (
                                <Square size={16} className="text-gray-400" />
                              )}
                              <span
                                className={`text-sm ${rec.returnedAssetIds.includes(assetId) ? "line-through text-gray-400" : "text-gray-700"}`}
                              >
                                {assetName(assetId)}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                      {rec.notes && (
                        <p className="mt-3 text-xs text-gray-400">
                          Note: {rec.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {offboardingRecords.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
                No offboarding records
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Onboarding Modal */}
      {addOnOpen && (
        <Modal
          title="Add Onboarding Record"
          onClose={() => setAddOnOpen(false)}
        >
          <div className="space-y-3">
            <div>
              <label
                htmlFor="onEmployee"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Employee
              </label>
              <select
                id="onEmployee"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={onForm.employeeId}
                onChange={(e) =>
                  setOnForm((p) => ({ ...p, employeeId: e.target.value }))
                }
              >
                <option value="">-- Select Employee --</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.department})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="onJoiningDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Joining Date
              </label>
              <input
                id="onJoiningDate"
                type="date"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={onForm.joiningDate}
                onChange={(e) =>
                  setOnForm((p) => ({ ...p, joiningDate: e.target.value }))
                }
              />
            </div>
            <div>
              <label
                htmlFor="onNotes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Notes
              </label>
              <textarea
                id="onNotes"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                value={onForm.notes}
                onChange={(e) =>
                  setOnForm((p) => ({ ...p, notes: e.target.value }))
                }
              />
            </div>
            <button
              type="button"
              onClick={addOnboarding}
              disabled={!onForm.employeeId || !onForm.joiningDate}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-sm transition-colors"
            >
              Create Onboarding Record
            </button>
          </div>
        </Modal>
      )}

      {/* Add Offboarding Modal */}
      {addOffOpen && (
        <Modal
          title="Add Offboarding Record"
          onClose={() => setAddOffOpen(false)}
        >
          <div className="space-y-3">
            <div>
              <label
                htmlFor="offEmployee"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Employee
              </label>
              <select
                id="offEmployee"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={offForm.employeeId}
                onChange={(e) =>
                  setOffForm((p) => ({ ...p, employeeId: e.target.value }))
                }
              >
                <option value="">-- Select Employee --</option>
                {employees
                  .filter(
                    (e) => e.status === "active" || e.status === "offboarding",
                  )
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.department})
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="offLeavingDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Leaving Date
              </label>
              <input
                id="offLeavingDate"
                type="date"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={offForm.leavingDate}
                onChange={(e) =>
                  setOffForm((p) => ({ ...p, leavingDate: e.target.value }))
                }
              />
            </div>
            <div>
              <label
                htmlFor="offNotes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Notes
              </label>
              <textarea
                id="offNotes"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                value={offForm.notes}
                onChange={(e) =>
                  setOffForm((p) => ({ ...p, notes: e.target.value }))
                }
              />
            </div>
            {offForm.employeeId && (
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-700">
                Currently assigned assets will be auto-populated for return
                tracking.
              </div>
            )}
            <button
              type="button"
              onClick={addOffboarding}
              disabled={!offForm.employeeId || !offForm.leavingDate}
              className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-sm transition-colors"
            >
              Create Offboarding Record
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
