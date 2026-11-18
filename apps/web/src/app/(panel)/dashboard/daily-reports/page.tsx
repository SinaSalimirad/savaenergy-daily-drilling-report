import { redirect } from "next/navigation";

export default function Page() {
  redirect("/dashboard/daily-reports/report-list");
}
