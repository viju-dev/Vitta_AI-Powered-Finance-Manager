"use client";

import dynamic from "next/dynamic";
import { BarLoader } from "react-spinners";

const AccountChart = dynamic(() => import("./account-chart"), {
  ssr: false,
  loading: () => <BarLoader className="mt-4" width={100} color="#9333ea" />,
});

export default function AccountChartClient(props) {
  return <AccountChart {...props} />;
}
