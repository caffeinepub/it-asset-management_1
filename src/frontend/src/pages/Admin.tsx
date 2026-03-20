import {
  AlertCircle,
  CheckCircle,
  Database,
  Eye,
  EyeOff,
  Mail,
  Save,
} from "lucide-react";
import { useState } from "react";

interface DbConfig {
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
}

interface SmtpConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  fromName: string;
  fromEmail: string;
  encryption: "none" | "ssl" | "tls";
}

type SaveStatus = "idle" | "saving" | "success" | "error";

export default function Admin() {
  const [dbConfig, setDbConfig] = useState<DbConfig>({
    host: "",
    port: "5432",
    database: "",
    username: "",
    password: "",
    ssl: true,
  });

  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>({
    host: "",
    port: "587",
    username: "",
    password: "",
    fromName: "",
    fromEmail: "",
    encryption: "tls",
  });

  const [showDbPassword, setShowDbPassword] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [dbSaveStatus, setDbSaveStatus] = useState<SaveStatus>("idle");
  const [smtpSaveStatus, setSmtpSaveStatus] = useState<SaveStatus>("idle");
  const [dbTestStatus, setDbTestStatus] = useState<SaveStatus>("idle");
  const [smtpTestStatus, setSmtpTestStatus] = useState<SaveStatus>("idle");

  const simulateSave = (setSaveStatus: (s: SaveStatus) => void) => {
    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }, 800);
  };

  const simulateTest = (setTestStatus: (s: SaveStatus) => void) => {
    setTestStatus("saving");
    setTimeout(() => {
      setTestStatus("success");
      setTimeout(() => setTestStatus("idle"), 3000);
    }, 1200);
  };

  const inputClass =
    "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const labelClass = "block text-xs font-medium text-gray-600 mb-1";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Admin Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure your database connection and email SMTP settings.
        </p>
      </div>

      {/* Database Configuration */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Database size={16} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Database Configuration
            </h3>
            <p className="text-xs text-gray-500">
              PostgreSQL connection settings
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 sm:grid sm:grid-cols-3 sm:gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="db-host" className={labelClass}>
                  Host
                </label>
                <input
                  id="db-host"
                  className={inputClass}
                  placeholder="localhost or db.example.com"
                  value={dbConfig.host}
                  onChange={(e) =>
                    setDbConfig({ ...dbConfig, host: e.target.value })
                  }
                />
              </div>
              <div>
                <label htmlFor="db-port" className={labelClass}>
                  Port
                </label>
                <input
                  id="db-port"
                  className={inputClass}
                  placeholder="5432"
                  value={dbConfig.port}
                  onChange={(e) =>
                    setDbConfig({ ...dbConfig, port: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label htmlFor="db-name" className={labelClass}>
                Database Name
              </label>
              <input
                id="db-name"
                className={inputClass}
                placeholder="asset_manager"
                value={dbConfig.database}
                onChange={(e) =>
                  setDbConfig({ ...dbConfig, database: e.target.value })
                }
              />
            </div>

            <div>
              <label htmlFor="db-user" className={labelClass}>
                Username
              </label>
              <input
                id="db-user"
                className={inputClass}
                placeholder="postgres"
                value={dbConfig.username}
                onChange={(e) =>
                  setDbConfig({ ...dbConfig, username: e.target.value })
                }
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="db-pass" className={labelClass}>
                Password
              </label>
              <div className="relative">
                <input
                  id="db-pass"
                  className={inputClass}
                  type={showDbPassword ? "text" : "password"}
                  placeholder="Enter database password"
                  value={dbConfig.password}
                  onChange={(e) =>
                    setDbConfig({ ...dbConfig, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowDbPassword(!showDbPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showDbPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="sm:col-span-2 flex items-center gap-2">
              <input
                id="ssl-toggle"
                type="checkbox"
                checked={dbConfig.ssl}
                onChange={(e) =>
                  setDbConfig({ ...dbConfig, ssl: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="ssl-toggle" className="text-sm text-gray-700">
                Enable SSL/TLS
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => simulateSave(setDbSaveStatus)}
              disabled={dbSaveStatus === "saving"}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              <Save size={14} />
              {dbSaveStatus === "saving" ? "Saving..." : "Save Configuration"}
            </button>
            <button
              type="button"
              onClick={() => simulateTest(setDbTestStatus)}
              disabled={dbTestStatus === "saving"}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-60 transition-colors"
            >
              {dbTestStatus === "saving" ? "Testing..." : "Test Connection"}
            </button>
            {dbSaveStatus === "success" && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle size={14} /> Saved successfully
              </span>
            )}
            {dbTestStatus === "success" && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle size={14} /> Connection successful
              </span>
            )}
            {dbSaveStatus === "error" && (
              <span className="flex items-center gap-1.5 text-sm text-red-500">
                <AlertCircle size={14} /> Save failed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SMTP Configuration */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Mail size={16} className="text-purple-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">
              Email SMTP Configuration
            </h3>
            <p className="text-xs text-gray-500">
              Outgoing mail server settings for notifications
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:col-span-2">
              <div className="sm:col-span-2">
                <label htmlFor="smtp-host" className={labelClass}>
                  SMTP Host
                </label>
                <input
                  id="smtp-host"
                  className={inputClass}
                  placeholder="smtp.gmail.com"
                  value={smtpConfig.host}
                  onChange={(e) =>
                    setSmtpConfig({ ...smtpConfig, host: e.target.value })
                  }
                />
              </div>
              <div>
                <label htmlFor="smtp-port" className={labelClass}>
                  Port
                </label>
                <input
                  id="smtp-port"
                  className={inputClass}
                  placeholder="587"
                  value={smtpConfig.port}
                  onChange={(e) =>
                    setSmtpConfig({ ...smtpConfig, port: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label htmlFor="smtp-user" className={labelClass}>
                Username / Email
              </label>
              <input
                id="smtp-user"
                className={inputClass}
                type="email"
                placeholder="notifications@company.com"
                value={smtpConfig.username}
                onChange={(e) =>
                  setSmtpConfig({ ...smtpConfig, username: e.target.value })
                }
              />
            </div>

            <div>
              <label htmlFor="smtp-pass" className={labelClass}>
                Password / App Password
              </label>
              <div className="relative">
                <input
                  id="smtp-pass"
                  className={inputClass}
                  type={showSmtpPassword ? "text" : "password"}
                  placeholder="Enter SMTP password"
                  value={smtpConfig.password}
                  onChange={(e) =>
                    setSmtpConfig({ ...smtpConfig, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSmtpPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="smtp-from-name" className={labelClass}>
                From Name
              </label>
              <input
                id="smtp-from-name"
                className={inputClass}
                placeholder="IT Asset Manager"
                value={smtpConfig.fromName}
                onChange={(e) =>
                  setSmtpConfig({ ...smtpConfig, fromName: e.target.value })
                }
              />
            </div>

            <div>
              <label htmlFor="smtp-from-email" className={labelClass}>
                From Email
              </label>
              <input
                id="smtp-from-email"
                className={inputClass}
                type="email"
                placeholder="noreply@company.com"
                value={smtpConfig.fromEmail}
                onChange={(e) =>
                  setSmtpConfig({ ...smtpConfig, fromEmail: e.target.value })
                }
              />
            </div>

            <div className="sm:col-span-2">
              <p className={labelClass}>Encryption</p>
              <div className="flex gap-4">
                {(["none", "ssl", "tls"] as const).map((enc) => (
                  <label
                    key={enc}
                    className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="encryption"
                      value={enc}
                      checked={smtpConfig.encryption === enc}
                      onChange={() =>
                        setSmtpConfig({ ...smtpConfig, encryption: enc })
                      }
                      className="w-4 h-4 text-blue-600"
                    />
                    {enc === "none" ? "None" : enc.toUpperCase()}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => simulateSave(setSmtpSaveStatus)}
              disabled={smtpSaveStatus === "saving"}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              <Save size={14} />
              {smtpSaveStatus === "saving" ? "Saving..." : "Save Configuration"}
            </button>
            <button
              type="button"
              onClick={() => simulateTest(setSmtpTestStatus)}
              disabled={smtpTestStatus === "saving"}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-60 transition-colors"
            >
              {smtpTestStatus === "saving" ? "Testing..." : "Send Test Email"}
            </button>
            {smtpSaveStatus === "success" && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle size={14} /> Saved successfully
              </span>
            )}
            {smtpTestStatus === "success" && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle size={14} /> Test email sent
              </span>
            )}
            {smtpSaveStatus === "error" && (
              <span className="flex items-center gap-1.5 text-sm text-red-500">
                <AlertCircle size={14} /> Save failed
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
