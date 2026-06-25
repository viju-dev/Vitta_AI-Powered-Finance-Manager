"use client";

import dynamic from "next/dynamic";
import { BarLoader } from "react-spinners";

const DashboardOverview = dynamic(() => import("./transaction-overview"), {
  ssr: false,
  loading: () => <BarLoader className="mt-4" width={100} color="#9333ea" />,
});

export default function DashboardOverviewClient(props) {
  return <DashboardOverview {...props} />;
}
