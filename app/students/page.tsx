import { redirect } from "next/navigation";
import { authClient } from "@/app/_lib/auth-client";
import { headers } from "next/headers";
import { getUserTrainData } from "@/app/_lib/api/fetch-generated";
import { BottomNav } from "@/app/_components/bottom-nav";
import { LogoAI } from "@/app/_components/logo-ai";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import Link from "next/link";
import { customFetch } from "@/app/_lib/fetch";
import { AcceptStudentButton } from "./_components/accept-student-button";

interface Student {
    id: string;
    status: string;
    createdAt: string;
    student: {
        id: string;
        name: string;
        email: string;
        image: string | null;
    };
}

async function getMyStudents() {
    return customFetch<{ status: number; data: Student[] }>("/trainer/students", {
        method: "GET",
    });
}

export default async function StudentsPage() {
    const session = await authClient.getSession({
        fetchOptions: { headers: await headers() },
    });

    if (!session.data?.user) redirect("/auth");

    const [trainData, studentsData] = await Promise.all([
        getUserTrainData(),
        getMyStudents(),
    ]);

    const data = trainData.status === 200 ? trainData.data : null;
    const isTrainer = data?.isTrainer ?? false;

    if (!data) redirect("/onboarding/role");
    if (!isTrainer) redirect("/profile");

    const students = studentsData.status === 200 ? studentsData.data : [];

    return (
        <div className="flex min-h-svh flex-col bg-background pb-24">
            <div className="flex flex-col gap-1 px-5 pt-5">
                <LogoAI />
            </div>

            <div className="flex flex-col gap-4 px-5 pt-6">
                <div className="flex items-center gap-2">
                    <Users className="size-5 text-primary" />
                    <h1 className="font-heading text-xl font-semibold text-foreground">
                        Meus Alunos
                    </h1>
                </div>

                {students.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-xl bg-muted py-12">
                        <Users className="size-8 text-muted-foreground" />
                        <p className="font-heading text-sm text-muted-foreground">
                            Nenhum aluno vinculado ainda
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {students.map((link) => (
                            <StudentCard key={link.id} link={link} />
                        ))}
                    </div>
                )}
            </div>

          <BottomNav activePage="students" />
        </div>
    );
}

function StudentCard({ link }: { link: Student }) {
  const isPending = link.status === "PENDING";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="size-11">
            <AvatarImage src={link.student.image ?? undefined} />
            <AvatarFallback>
              {link.student.name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <span className="font-heading text-sm font-semibold text-foreground">
              {link.student.name}
            </span>
            <span className="font-heading text-xs text-muted-foreground">
              {link.student.email}
            </span>
          </div>
        </div>

        {!isPending && (
          <Link
            href={`/students/${link.student.id}`}
            className="rounded-lg bg-primary px-3 py-1.5 font-heading text-xs font-semibold text-primary-foreground"
          >
            Ver treinos
          </Link>
        )}
      </div>

      {isPending && <AcceptStudentButton linkId={link.id} />}
    </div>
  );
}