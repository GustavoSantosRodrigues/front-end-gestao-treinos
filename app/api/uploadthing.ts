import { generateReactHelpers } from "@uploadthing/react";
import { OurFileRouter } from "./uploadthing/core";


export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();