import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
  const { props, url } = usePage();

  // Roles & current org id from Inertia shared props (see HandleInertiaRequests)
  const roles = props?.auth?.roles || props?.auth?.user?.roles || [];
  const isAdmin = Array.isArray(roles)
    ? roles.some((r) => (typeof r === 'string' ? r : r?.name) === 'admin')
    : (props?.auth?.user?.role === 'admin' || props?.auth?.user?.is_admin === true);

  const currentOrgId =
    props?.current_organization ??
    props?.organization?.id ??
    null;

  const handleImageError = () => {
    document.getElementById('screenshot-container')?.classList.add('!hidden');
    document.getElementById('docs-card')?.classList.add('!row-span-1');
    document.getElementById('docs-card-content')?.classList.add('!flex-row');
    document.getElementById('background')?.classList.add('!hidden');
  };

  return (
    <>
      <Head title="Welcome" />
      <div className="bg-gray-50 text-black/70 dark:bg-black dark:text-white/70">
        {/* optional laravel bg image; hidden in dark or if it fails */}
        <img
          id="background"
          className="absolute -left-20 top-0 max-w-[877px] opacity-10 dark:opacity-0"
          src="https://laravel.com/assets/img/welcome/background.svg"
          onError={handleImageError}
          alt=""
        />

        <div className="relative flex min-h-screen flex-col items-center justify-center">
          <div className="relative w-full max-w-7xl px-6">
            {/* Top bar: brand left, auth links right */}
            <header className="flex items-center justify-between py-6">
              <div className="flex flex-col">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                  MULTI ORGANIZATION CONTACTS AND NOTES APPLICATION
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  powered by Zikra Infotech LLC
                </p>
              </div>

              <nav className="-mx-3 flex items-center">
                {auth?.user ? (
                  <Link
                    href={route('dashboard')}
                    className="rounded-md px-3 py-2 text-gray-800 hover:text-black dark:text-gray-200 dark:hover:text-white transition"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href={route('login')}
                      className="rounded-md px-3 py-2 text-gray-800 hover:text-black dark:text-gray-200 dark:hover:text-white transition"
                    >
                      Log in
                    </Link>
                    <Link
                      href={route('register')}
                      className="rounded-md px-3 py-2 text-gray-800 hover:text-black dark:text-gray-200 dark:hover:text-white transition"
                    >
                      Register
                    </Link>
                  </>
                )}
              </nav>
            </header>

            {/* Main content: quick actions */}
            <main className="mt-2">
              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link
                  href={route('organizations.index')}
                  className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-1 focus:ring-gray-400 dark:bg-zinc-900 dark:border-zinc-800"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 group-hover:text-gray-700 dark:text-white">
                        Organizations
                      </h2>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Create and switch organizations.
                      </p>
                    </div>
                    <span className="text-gray-400">→</span>
                  </div>
                </Link>

                <Link
                  href={route('contacts.index')}
                  className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-1 focus:ring-gray-400 dark:bg-zinc-900 dark:border-zinc-800"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 group-hover:text-gray-700 dark:text-white">
                        Contacts
                      </h2>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Manage contacts for the current org.
                      </p>
                    </div>
                    <span className="text-gray-400">→</span>
                  </div>
                </Link>

                {isAdmin && (
                  <Link
                    href={route('users.index')}
                    className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-1 focus:ring-gray-400 dark:bg-zinc-900 dark:border-zinc-800"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-medium text-gray-900 group-hover:text-gray-700 dark:text-white">
                          Users
                        </h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          Manage users & global roles.
                        </p>
                      </div>
                      <span className="text-gray-400">→</span>
                    </div>
                  </Link>
                )}

                {isAdmin && currentOrgId && (
                  <Link
                    href={route('org.users.index', currentOrgId)}
                    className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-1 focus:ring-gray-400 dark:bg-zinc-900 dark:border-zinc-800"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-medium text-gray-900 group-hover:text-gray-700 dark:text-white">
                          Org Members
                        </h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          Add/remove members, set org role.
                        </p>
                      </div>
                      <span className="text-gray-400">→</span>
                    </div>
                  </Link>
                )}
              </section>

              {/* Primary create actions */}
              <section className="mt-8 grid gap-4 sm:grid-cols-2">
                <Link
                  href={route('organizations.createForm')}
                  className="rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm hover:shadow-md transition dark:bg-zinc-900 dark:border-zinc-800"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">
                        New Organization
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Create an organization (you become admin).
                      </p>
                    </div>
                    <span className="ml-3 text-gray-400">→</span>
                  </div>
                </Link>

                <Link
                  href={route('contacts.createForm')}
                  className="rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm hover:shadow-md transition dark:bg-zinc-900 dark:border-zinc-800"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">
                        New Contact
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Add a contact to the current organization.
                      </p>
                    </div>
                    <span className="ml-3 text-gray-400">→</span>
                  </div>
                </Link>
              </section>
            </main>

            <footer className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
              MULTI ORGANIZATION CONTACTS AND NOTES APPLICATION • powered by zikra info tech llc
              <div className="mt-1">Laravel v{laravelVersion} (PHP v{phpVersion})</div>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}
