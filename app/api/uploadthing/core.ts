import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { headers } from "next/headers";
import { authClient } from "@/app/_lib/auth-client";

const f = createUploadthing();

export const ourFileRouter = {
  coverImageUploader: f({
    image: {
      maxFileSize: "2MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const session = await authClient.getSession({
        fetchOptions: { headers: await headers() },
      });

      if (!session.data?.user) throw new UploadThingError("Unauthorized");

      return { userId: session.data.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload completo para userId:", metadata.userId);
      console.log("URL:", file.ufsUrl);
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;