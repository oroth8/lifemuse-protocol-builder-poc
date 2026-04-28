import Link from "next/link";
import { AppShell } from "../components/AppShell";

const MEMBERS = [
  {
    id: 69,
    fullName: "Nico Zubia",
    email: "nico.zubia@example.com",
    memberType: "dependent",
    membership: "Test Household",
    salesforceId: "001XX000004DGbQ",
    initials: "NZ",
  },
  {
    id: 67,
    fullName: "Dasecond Doe",
    email: "dasecond.doe@example.com",
    memberType: "secondary",
    membership: "Test Household",
    salesforceId: "001XX000004DGbR",
    initials: "DD",
  },
  {
    id: 34,
    fullName: "Owen Member",
    email: "owen@launchpadlab.com",
    memberType: "primary",
    membership: "—",
    salesforceId: "001XX000004DGbS",
    initials: "OM",
  },
  {
    id: 1,
    fullName: "Test Member",
    email: "test.member@example.com",
    memberType: "primary",
    membership: "Test Household",
    salesforceId: "001XX000004DGbT",
    initials: "TM",
  },
];

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function IconSort() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400" aria-hidden>
      <path d="m8 9 4-4 4 4" />
      <path d="m16 15-4 4-4-4" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500" aria-hidden>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconPencil() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500" aria-hidden>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500" aria-hidden>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

export default function MembersPage() {
  return (
    <AppShell mainClassName="flex min-h-screen min-w-0 flex-1 flex-col bg-[#f4f4f4]">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="mx-auto max-w-[1400px]">
          <nav className="text-sm" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 hover:underline">
                  Home
                </Link>
              </li>
              <li className="text-gray-400" aria-hidden>
                &gt;
              </li>
              <li className="font-medium text-gray-600">Members</li>
            </ol>
          </nav>

          <div className="mt-5 flex flex-col gap-4 sm:mt-6 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Members</h1>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.15)] transition-colors hover:bg-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              <IconPlus />
              Create new member
            </button>
          </div>

          <section className="mt-6 overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)]">
            <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
              <label className="relative block max-w-md">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <IconSearch />
                </span>
                <input
                  type="search"
                  placeholder="Search"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-300 focus:bg-white"
                />
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/90 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="w-10 px-3 py-3 sm:px-4">
                      <span className="sr-only">Select</span>
                      <input type="checkbox" className="rounded border-gray-300 text-gray-900" aria-label="Select all" />
                    </th>
                    <th className="whitespace-nowrap px-3 py-3 sm:px-4">
                      <button type="button" className="inline-flex items-center gap-1 font-semibold text-gray-500 hover:text-gray-700">
                        ID
                        <IconSort />
                      </button>
                    </th>
                    <th className="whitespace-nowrap px-3 py-3 sm:px-4">
                      <button type="button" className="inline-flex items-center gap-1 font-semibold text-gray-500 hover:text-gray-700">
                        Full name
                        <IconSort />
                      </button>
                    </th>
                    <th className="whitespace-nowrap px-3 py-3 sm:px-4">Email address</th>
                    <th className="whitespace-nowrap px-3 py-3 sm:px-4">Member type</th>
                    <th className="whitespace-nowrap px-3 py-3 sm:px-4">Membership</th>
                    <th className="whitespace-nowrap px-3 py-3 sm:px-4">Salesforce ID</th>
                    <th className="whitespace-nowrap px-3 py-3 sm:px-4">Avatar</th>
                    <th className="w-[120px] px-3 py-3 sm:px-4">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MEMBERS.map((row, i) => (
                    <tr key={row.id} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
                      <td className="px-3 py-3 sm:px-4">
                        <input type="checkbox" className="rounded border-gray-300" aria-label={`Select ${row.fullName}`} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 font-medium text-gray-900 sm:px-4">{row.id}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-gray-900 sm:px-4">{row.fullName}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-gray-600 sm:px-4">{row.email}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-gray-600 sm:px-4 capitalize">{row.memberType}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-gray-600 sm:px-4">{row.membership}</td>
                      <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-gray-600 sm:px-4">{row.salesforceId}</td>
                      <td className="px-3 py-3 sm:px-4">
                        <span
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700"
                          aria-hidden
                        >
                          {row.initials}
                        </span>
                      </td>
                      <td className="px-3 py-3 sm:px-4">
                        <div className="flex items-center gap-1">
                          <button type="button" className="rounded-md p-1.5 hover:bg-gray-100" aria-label={`View ${row.fullName}`}>
                            <IconEye />
                          </button>
                          <button type="button" className="rounded-md p-1.5 hover:bg-gray-100" aria-label={`Edit ${row.fullName}`}>
                            <IconPencil />
                          </button>
                          <button type="button" className="rounded-md p-1.5 hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${row.fullName}`}>
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <select className="rounded-lg border border-gray-200 bg-white py-1.5 pl-2 pr-8 text-sm text-gray-900 focus:border-gray-300 focus:outline-none">
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                  <option value={96}>96</option>
                </select>
                <span>per page</span>
              </label>
              <p className="text-sm text-gray-600">Displaying {MEMBERS.length} items</p>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
