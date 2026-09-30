"use client";

import { LogOut } from "lucide-react";

export default function LogoutButton() {
  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.assign("/admin/login");
  }
  return (
    <button onClick={handleLogout} className="btn btn-ghost !py-2 !text-xs">
      <LogOut size={14} />
      Se déconnecter
    </button>
  );
}
