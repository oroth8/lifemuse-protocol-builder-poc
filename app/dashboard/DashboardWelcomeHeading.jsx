"use client";

import { usePrototypeRole } from "../components/PrototypeRoleProvider";

export function DashboardWelcomeHeading() {
  const { role } = usePrototypeRole();

  return (
    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
      Welcome, {role.firstName}!
    </h1>
  );
}
