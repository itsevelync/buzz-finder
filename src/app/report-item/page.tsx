import ReportItemClient from "./ReportItemClient";
import { auth } from "@/auth";

export default async function ReportItem() {
    const session = await auth();

    return <ReportItemClient userId={session?.user?._id} />;
}
