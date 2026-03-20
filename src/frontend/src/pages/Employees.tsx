import { Monitor, Pencil, Plus, X } from "lucide-react";
import { useState } from "react";
import type { Asset, Assignment, Employee } from "../types";

interface Props {
  employees: Employee[];
  assets: Asset[];
  assignments: Assignment[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  onboarding: "bg-blue-100 text-blue-700",
  offboarding: "bg-amber-100 text-amber-700",
  inactive: "bg-gray-100 text-gray-600",
};

const emptyEmp: Omit<Employee, "id"> = {
  name: "",
  department: "",
  role: "",
  email: "",
  phone: "",
  joinDate: "",
  status: "active",
};

export default function Employees({
  employees,
  assets,
  assignments,
  setEmployees,
}: Props) {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editEmp, setEditEmp] = useState<Employee | null>(null);
  const [viewEmp, setViewEmp] = useState<Employee | null>(null);
  const [form, setForm] = useState<Omit<Employee, "id">>(emptyEmp);

  const departments = [...new Set(employees.map((e) => e.department))];

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      e.name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q);
    const matchDept = deptFilter === "all" || e.department === deptFilter;
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  function save() {
    if (!form.name || !form.email) return;
    if (editEmp) {
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === editEmp.id ? { ...form, id: editEmp.id } : e,
        ),
      );
      setEditEmp(null);
    } else {
      setEmployees((prev) => [
        ...prev,
        { ...form, id: `E${String(Date.now()).slice(-6)}` },
      ]);
      setAddOpen(false);
    }
    setForm(emptyEmp);
  }

  function openEdit(emp: Employee) {
    setEditEmp(emp);
    setForm({
      name: emp.name,
      department: emp.department,
      role: emp.role,
      email: emp.email,
      phone: emp.phone,
      joinDate: emp.joinDate,
      status: emp.status,
    });
  }

  const currentAssets = (empId: string) =>
    assignments
      .filter((a) => a.employeeId === empId && !a.returnedDate)
      .map((a) => assets.find((x) => x.id === a.assetId))
      .filter(Boolean) as Asset[];
  const historyAssets = (empId: string) =>
    assignments
      .filter((a) => a.employeeId === empId && a.returnedDate)
      .map((a) => ({
        asset: assets.find((x) => x.id === a.assetId),
        assignment: a,
      }))
      .filter((x) => x.asset) as { asset: Asset; assignment: Assignment }[];

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

  const EmpForm = () => (
    <div className="space-y-3">
      {[
        ["Full Name", "name", "text"],
        ["Department", "department", "text"],
        ["Role", "role", "text"],
        ["Email", "email", "email"],
        ["Phone", "phone", "tel"],
        ["Join Date", "joinDate", "date"],
      ].map(([label, key, type]) => (
        <div key={key}>
          <label
            htmlFor={key}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
          <input
            id={key}
            type={type}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={String(form[key as keyof typeof form])}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, [key]: e.target.value }))
            }
          />
        </div>
      ))}
      <div>
        <label
          htmlFor="empStatus"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Status
        </label>
        <select
          id="empStatus"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.status}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              status: e.target.value as Employee["status"],
            }))
          }
        >
          {["active", "onboarding", "offboarding", "inactive"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={save}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition-colors"
      >
        {editEmp ? "Update Employee" : "Add Employee"}
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employees</h2>
          <p className="text-gray-500 text-sm mt-1">
            {employees.length} total employees
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setForm(emptyEmp);
            setAddOpen(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Add Employee
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          {["active", "onboarding", "offboarding", "inactive"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {[
                  "ID",
                  "Name",
                  "Department",
                  "Role",
                  "Email",
                  "Status",
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
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {emp.id}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {emp.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{emp.department}</td>
                  <td className="px-4 py-3 text-gray-600">{emp.role}</td>
                  <td className="px-4 py-3 text-gray-500">{emp.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[emp.status]}`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(emp)}
                        title="Edit"
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewEmp(emp)}
                        title="View Assets"
                        className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Monitor size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {addOpen && (
        <Modal title="Add New Employee" onClose={() => setAddOpen(false)}>
          <EmpForm />
        </Modal>
      )}
      {editEmp && (
        <Modal title="Update Employee" onClose={() => setEditEmp(null)}>
          <EmpForm />
        </Modal>
      )}

      {viewEmp && (
        <Modal
          title={`Assets: ${viewEmp.name}`}
          onClose={() => setViewEmp(null)}
        >
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                Currently Assigned
              </h4>
              {currentAssets(viewEmp.id).length === 0 ? (
                <p className="text-gray-400 text-sm">
                  No assets currently assigned.
                </p>
              ) : (
                <div className="space-y-2">
                  {currentAssets(viewEmp.id).map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100"
                    >
                      <Monitor size={16} className="text-green-600" />
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {a.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {a.serialNumber} &bull; {a.category}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                Assignment History
              </h4>
              {historyAssets(viewEmp.id).length === 0 ? (
                <p className="text-gray-400 text-sm">No assignment history.</p>
              ) : (
                <div className="space-y-2">
                  {historyAssets(viewEmp.id).map(({ asset, assignment }) => (
                    <div
                      key={assignment.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <Monitor size={16} className="text-gray-400" />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-700">
                          {asset.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {assignment.assignedDate} &rarr;{" "}
                          {assignment.returnedDate}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
