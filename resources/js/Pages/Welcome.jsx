import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
  const { props } = usePage();

  // Roles & current org id from shared props (HandleInertiaRequests)
  const roles = props?.auth?.roles || props?.auth?.user?.roles || [];
  const isAdmin = Array.isArray(roles)
    ? roles.some((r) => (typeof r === 'string' ? r : r?.name) === 'admin')
    : (props?.auth?.user?.role === 'admin' || props?.auth?.user?.is_admin === true);

  const currentOrgId = props?.current_organization ?? props?.organization?.id ?? null;

  // Hard-disable page scrolling while this view is mounted
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-50 text-gray-800 dark:bg-black dark:text-white/80">
      <Head title="Welcome" />

      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4">
          <div className="leading-tight">
            <h1 className="text-base sm:text-lg md:text-xl font-semibold">
              MULTI ORGANIZATION CONTACTS AND NOTES APPLICATION
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              powered by Zikra Info Tech LLC
            </p>
          </div>

          <nav className="flex items-center gap-2">
            {auth?.user ? (
              <Link
                href={route('dashboard')}
                className="px-3 py-2 rounded-md text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-zinc-900"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href={route('login')}
                  className="px-3 py-2 rounded-md text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-zinc-900"
                >
                  Log in
                </Link>
                <Link
                  href={route('register')}
                  className="px-3 py-2 rounded-md text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-zinc-900"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </header>

        {/* Main (centered, no scroll) */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-5xl">
            {/* Primary sections */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card
                title="Organizations"
                desc="Create & switch organizations."
                href={route('organizations.index')}
              />
              <Card
                title="Contacts"
                desc="Manage org contacts."
                href={route('contacts.index')}
              />
              {isAdmin && (
                <Card
                  title="Users"
                  desc="Manage users & global roles."
                  href={route('users.index')}
                />
              )}
              {isAdmin && currentOrgId && (
                <Card
                  title="Org Members"
                  desc="Add/remove members, set roles."
                  href={route('org.users.index', currentOrgId)}
                />
              )}
            </div>

            {/* Call-to-actions */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Action
                title="New Organization"
                desc="You become the admin."
                href={route('organizations.createForm')}
              />
              <Action
                title="New Contact"
                desc="Add a contact to the current org."
                href={route('contacts.createForm')}
              />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 text-center text-xs text-gray-500 dark:text-gray-400">
          Laravel v{laravelVersion} (PHP v{phpVersion})
        </footer>
      </div>
    </div>
  );
}

function Card({ title, desc, href }) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-1 focus:ring-gray-400 dark:bg-zinc-900 dark:border-zinc-800"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-medium text-gray-900 group-hover:text-gray-700 dark:text-white">
            {title}
          </h2>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{desc}</p>
        </div>
        <span className="text-gray-400">→</span>
      </div>
    </Link>
  );
}

function Action({ title, desc, href }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm hover:shadow-md transition dark:bg-zinc-900 dark:border-zinc-800"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{desc}</p>
        </div>
        <span className="ml-3 text-gray-400">→</span>
      </div>
    </Link>
  );
}
