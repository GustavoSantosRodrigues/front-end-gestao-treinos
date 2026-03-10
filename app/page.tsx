

import { redirect } from "next/navigation";
import { authClient } from "@/app/_lib/auth-client";
import { headers } from "next/headers";
import { get } from "http";
import { getHomeData } from "./_lib/api/fetch-generated";
import dayjs from "dayjs";

export default async function Home() {
  const  session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });


  if (!session.data?.user) redirect("/auth");

  const homeData = await getHomeData(dayjs().format("YYYY-MM-DD"));

  console.log(homeData);
  return (
    <div className="flex min-h-svh items-center justify-center">
      <p>Home</p>
    </div>
  );
}
