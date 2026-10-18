import { redirect } from "next/navigation";

export function generateStaticParams() {
  return [{ slug: ["dashboard"] }];
}

export default function Page() {
  redirect("/controlhub");
}
