import FoundItemForm from "../../components/report-item/FoundItemForm";
import { auth } from "@/auth";

export default async function ReportItem() {
    const session = await auth();

    return <FoundItemForm userId={session?.user?._id} />;
}
