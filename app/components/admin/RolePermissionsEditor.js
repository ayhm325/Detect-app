import { useState } from "react";
import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

export default function RolePermissionsEditor() {
  const { locale } = useLocale();
  const tr = locale === "ar" ? ar.adminAnalysis : en.adminAnalysis;
  const permTr = tr.rolePermissionsEditor || {};
  const roles = permTr.roles || (locale === "ar"
    ? ["أدمن", "طبيب", "مريض"]
    : ["Admin", "Doctor", "Patient"]);
  const permissions = permTr.permissions || (locale === "ar"
    ? ["قراءة", "كتابة", "تعديل", "حذف"]
    : ["Read", "Write", "Edit", "Delete"]);
  const defaultPerms = permTr.defaultPerms || {
    [roles[0]]: permissions,
    [roles[1]]: permissions.slice(0, 3),
    [roles[2]]: [permissions[0]]
  };
  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [rolePerms, setRolePerms] = useState(defaultPerms);

  const togglePerm = (perm) => {
    setRolePerms(prev => {
      const perms = prev[selectedRole];
      return {
        ...prev,
        [selectedRole]: perms.includes(perm)
          ? perms.filter(p => p !== perm)
          : [...perms, perm]
      };
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-yellow-100 max-w-xl mx-auto mt-8">
      <h3 className="font-bold text-xl mb-4 text-yellow-700">{permTr.title || (locale === "ar" ? "تعديل صلاحيات الدور" : "Edit Role Permissions")}</h3>
      <select className="mb-4 px-4 py-2 border rounded" value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
        {roles.map(role => <option key={role} value={role}>{role}</option>)}
      </select>
      <div className="flex gap-4 flex-wrap">
        {permissions.map(perm => (
          <label key={perm} className="flex items-center gap-2">
            <input type="checkbox" checked={rolePerms[selectedRole].includes(perm)} onChange={() => togglePerm(perm)} />
            {perm}
          </label>
        ))}
      </div>
    </div>
  );
}
