import { redirect } from "next/navigation";

/** Legacy route — Free Lab lives at `/laboratory`. */
export default function LabRedirectPage() {
  redirect("/laboratory");
}
