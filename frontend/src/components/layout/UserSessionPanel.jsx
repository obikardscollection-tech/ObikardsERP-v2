import { LogOut } from "lucide-react";
import useAuth from "../../hooks/useAuth";

function UserSessionPanel() {
  const { user, signOut } = useAuth();

  return (
    <div className="border-t border-slate-800 p-4">
      <p className="truncate text-sm font-semibold text-white">{user?.displayName}</p>
      <p className="mb-3 truncate text-xs text-slate-400">{user?.email}</p>
      <button type="button" onClick={signOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white">
        <LogOut size={16} />
        Déconnexion
      </button>
    </div>
  );
}

export default UserSessionPanel;