import React from "react";
import Dashboard from "@/MainComp/Dashboard";
import { Suspense } from "react";

export default function DashboardPage() {
  // Get the search params (query string)

  return (
    <Suspense>
      <Dashboard />
    </Suspense>
  );
}
