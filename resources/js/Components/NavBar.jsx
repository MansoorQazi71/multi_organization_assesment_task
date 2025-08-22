import React, { useState } from "react";
import { Link, usePage, router } from "@inertiajs/react";

export default function NavBar() {
  const { url, props } = usePage();
  const user = props.auth?.user;

  // Try to detect admin role in a few common shapes
  const roles = props.auth?.roles || user?.roles || [];
  const isAdmin = Array.isArray(roles)
    ? roles.some((r) => (typeof r === "string" ? r : r?.name) === "admin")
    : (user?.role === "admin" || user?.is_admin === true);

  // Best-effort current org id (shared via Inertia or present on pages like Organization/Manage)
  const currentOrgId =
    props.currentOrganization?.id ??
    props.current_organization ?? // if you share the raw session value
    props.organization?.id ??
    null;

  const isActive = (href) => url === href || url.startsWith(href + "/");

  // Base nav
  const nav = [
    { name: "Dashboard", href: route("dashboard") },
    { name: "Organizations", href: route("organizations.index") },
    { name: "Contacts", href: route("contacts.index") },
  ];

  // Admin-only links
  if (isAdmin) {
    nav.push({ name: "Users", href: route("users.index") });
    if (currentOrgId) {
      nav.push({ name: "Org Members", href: route("org.users.index", currentOrgId) });
    }
  }

  // Always include Profile last
  nav.push({ name: "Profile", href: route("profile.edit") });

  const handleLogout = (e) => {
    e.preventDefault();
    router.post(route("logout"));
  };

  // Mobile menu
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Left: brand + hamburger */}
          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle navigation"
              aria-expanded={open}
            >
              {/* hamburger icon */}
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5h14v2H3V5zm0 4h14v2H3V9zm0 4h14v2H3v-2z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Desktop links */}
            <div className="hidden md:flex items-center space-x-2">
              {nav.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(item.href)
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: user + logout */}
          <div className="flex items-center space-x-3">
            {user && (
              <span className="hidden sm:inline text-gray-300 text-sm">
                {user.name}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {open && (
          <div className="md:hidden pb-3 space-y-1">
            {nav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.href)
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
                onClick={() => setOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
