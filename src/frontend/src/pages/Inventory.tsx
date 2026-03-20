import { Clock, Pencil, Plus, Undo2, UserPlus, X } from "lucide-react";
import { useState } from "react";
import type { Asset, Assignment, Employee } from "../types";

interface Props {
  assets: Asset[];
  employees: Employee[];
  assignments: Assignment[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
}

const emptyAsset: Omit<Asset, "id"> = {
  name: "",
  category: "laptop",
  serialNumber: "",
  status: "available",
  purchaseDate: "",
  purchaseValue: 0,
  vendor: "",
  location: "",
  notes: "",
};

const statusColors: Record<string, string> = {
  available: "bg-green-100 text-green-700",
  assigned: "bg-blue-100 text-blue-700",
  "in-audit": "bg-amber-100 text-amber-700",
  retired: "bg-gray-100 text-gray-600",
};

export default function Inventory({
  assets,
  employees,
  assignments,
  setAssets,
  setAssignments,
}: Props) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [addOpen, setAddOpen] = useState(false);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [assignAsset, setAssignAsset] = useState<Asset | null>(null);
  const [historyAsset, setHistoryAsset] = useState<Asset | null>(null);

  const [form, setForm] = useState<Omit<Asset, "id">>(emptyAsset);
  const [assignEmployeeId, setAssignEmployeeId] = useState("");
  const [assignNotes, setAssignNotes] = useState("");

  const filtered = assets.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.name.toLowerCase().includes(q) ||
      a.serialNumber.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q);
    const matchCat = catFilter === "all" || a.category === catFilter;
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  function getAssignedEmployee(assetId: string): Employee | undefined {
    const active = assignments.find(
      (a) => a.assetId === assetId && !a.returnedDate,
    );
    if (!active) return undefined;
    return employees.find((e) => e.id === active.employeeId);
  }

  function saveAsset() {
    if (!form.name || !form.serialNumber) return;
    if (editAsset) {
      setAssets((prev) =>
        prev.map((a) =>
          a.id === editAsset.id ? { ...form, id: editAsset.id } : a,
        ),
      );
      setEditAsset(null);
    } else {
      const id = `A${String(Date.now()).slice(-6)}`;
      setAssets((prev) => [...prev, { ...form, id }]);
      setAddOpen(false);
    }
    setForm(emptyAsset);
  }

  function openEdit(asset: Asset) {
    setEditAsset(asset);
    setForm({
      name: asset.name,
      category: asset.category,
      serialNumber: asset.serialNumber,
      status: asset.status,
      purchaseDate: asset.purchaseDate,
      purchaseValue: asset.purchaseValue,
      vendor: asset.vendor,
      location: asset.location,
      notes: asset.notes,
    });
  }

  function doAssign() {
    if (!assignAsset || !assignEmployeeId) return;
    const id = `AS${Date.now()}`;
    setAssignments((prev) => [
      ...prev,
      {
        id,
        assetId: assignAsset.id,
        employeeId: assignEmployeeId,
        assignedDate: new Date().toISOString().split("T")[0],
        assignedBy: "Admin",
        notes: assignNotes,
      },
    ]);
    setAssets((prev) =>
      prev.map((a) =>
        a.id === assignAsset.id ? { ...a, status: "assigned" } : a,
      ),
    );
    setAssignAsset(null);
    setAssignEmployeeId("");
    setAssignNotes("");
  }

  function doReturn(asset: Asset) {
    const today = new Date().toISOString().split("T")[0];
    setAssignments((prev) =>
      prev.map((a) =>
        a.assetId === asset.id && !a.returnedDate
          ? { ...a, returnedDate: today }
          : a,
      ),
    );
    setAssets((prev) =>
      prev.map((a) => (a.id === asset.id ? { ...a, status: "available" } : a)),
    );
  }

  const assetHistory = historyAsset
    ? assignments
        .filter((a) => a.assetId === historyAsset.id)
        .sort(
          (a, b) =>
            new Date(b.assignedDate).getTime() -
            new Date(a.assignedDate).getTime(),
        )
    : [];

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

  const AssetForm = () => (
    <div className="space-y-3">
      {[
        ["Name", "name", "text"],
        ["Serial Number", "serialNumber", "text"],
        ["Vendor", "vendor", "text"],
        ["Location", "location", "text"],
        ["Purchase Date", "purchaseDate", "date"],
        ["Purchase Value ($)", "purchaseValue", "number"],
      ].map(([label, key, type]) => (
        <div key={key}>
          {/* biome-ignore lint/a11y/noLabelWithoutControl: dynamic label in map */}
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
          <input
            type={type}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={String(form[key as keyof typeof form])}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                [key]:
                  type === "number" ? Number(e.target.value) : e.target.value,
              }))
            }
          />
        </div>
      ))}
      <div>
        <label
          htmlFor="assetCategory"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Category
        </label>
        <select
          id="assetCategory"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.category}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              category: e.target.value as Asset["category"],
            }))
          }
        >
          {["laptop", "desktop", "server", "mobile", "other"].map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="assetStatus"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Status
        </label>
        <select
          id="assetStatus"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.status}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              status: e.target.value as Asset["status"],
            }))
          }
        >
          {["available", "assigned", "in-audit", "retired"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="assetNotes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Notes
        </label>
        <textarea
          id="assetNotes"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          value={form.notes}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, notes: e.target.value }))
          }
        />
      </div>
      <button
        type="button"
        onClick={saveAsset}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition-colors"
      >
        {editAsset ? "Update Asset" : "Add Asset"}
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory</h2>
          <p className="text-gray-500 text-sm mt-1">
            {assets.length} total assets
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setForm(emptyAsset);
            setAddOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Add Asset
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          placeholder="Search assets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          {["laptop", "desktop", "server", "mobile", "other"].map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          {["available", "assigned", "in-audit", "retired"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {[
                  "ID",
                  "Name",
                  "Serial #",
                  "Category",
                  "Status",
                  "Assigned To",
                  "Location",
                  "Vendor",
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
              {filtered.map((asset) => {
                const assignedEmp = getAssignedEmployee(asset.id);
                return (
                  <tr
                    key={asset.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {asset.id}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {asset.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {asset.serialNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-600 capitalize">
                      {asset.category}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[asset.status]}`}
                      >
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {assignedEmp ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                            {assignedEmp.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-gray-800 text-sm whitespace-nowrap">
                            {assignedEmp.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {asset.location}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{asset.vendor}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(asset)}
                          title="Update Details"
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAssignAsset(asset);
                            setAssignEmployeeId("");
                            setAssignNotes("");
                          }}
                          title="Assign"
                          disabled={asset.status !== "available"}
                          className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-40"
                        >
                          <UserPlus size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => doReturn(asset)}
                          title="Return"
                          disabled={asset.status !== "assigned"}
                          className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-40"
                        >
                          <Undo2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setHistoryAsset(asset)}
                          title="Assignment History"
                          className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Clock size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    No assets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {addOpen && (
        <Modal title="Add New Asset" onClose={() => setAddOpen(false)}>
          <AssetForm />
        </Modal>
      )}

      {/* Edit Modal */}
      {editAsset && (
        <Modal title="Update Asset Details" onClose={() => setEditAsset(null)}>
          <AssetForm />
        </Modal>
      )}

      {/* Assign Modal */}
      {assignAsset && (
        <Modal
          title={`Assign: ${assignAsset.name}`}
          onClose={() => setAssignAsset(null)}
        >
          <div className="space-y-3">
            <div>
              <label
                htmlFor="assignEmployee"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select Employee
              </label>
              <select
                id="assignEmployee"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={assignEmployeeId}
                onChange={(e) => setAssignEmployeeId(e.target.value)}
              >
                <option value="">-- Select Employee --</option>
                {employees
                  .filter((e) => e.status === "active")
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.department})
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="assignNotes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Notes
              </label>
              <textarea
                id="assignNotes"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                value={assignNotes}
                onChange={(e) => setAssignNotes(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={doAssign}
              disabled={!assignEmployeeId}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-sm transition-colors"
            >
              Confirm Assignment
            </button>
          </div>
        </Modal>
      )}

      {/* History Modal */}
      {historyAsset && (
        <Modal
          title={`Assignment History: ${historyAsset.name}`}
          onClose={() => setHistoryAsset(null)}
        >
          {assetHistory.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No assignment history found.
            </p>
          ) : (
            <div className="space-y-3">
              {assetHistory.map((a, i) => {
                const emp = employees.find((e) => e.id === a.employeeId);
                return (
                  <div key={a.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-600 mt-1" />
                      {i < assetHistory.length - 1 && (
                        <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="font-medium text-gray-900 text-sm">
                        {emp?.name || a.employeeId}
                      </p>
                      <p className="text-xs text-gray-500">
                        {a.assignedDate} → {a.returnedDate || "Current"}
                      </p>
                      {a.notes && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {a.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
