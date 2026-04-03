import { redirect } from "next/navigation";
import { authClient } from "@/app/_lib/auth-client";
import { headers } from "next/headers";
import { getUserTrainData } from "@/app/_lib/api/fetch-generated";
import RoleSelectionClient from "./_components/role-selection-client";

export default async function RoleSelectionPage() {
  const session = await authClient.getSession({
    fetchOptions: { headers: await headers() },
  });

  if (!session.data?.user) redirect("/auth");

  const trainData = await getUserTrainData();
  const data = trainData.status === 200 ? trainData.data : null;
  const hasFullData = data && "weightInGrams" in data;

  if (hasFullData) redirect("/");

  return <RoleSelectionClient />;
}