import LostItemForm from "../../components/report-item/LostItemForm";
import { auth } from "@/auth";

export default async function ReportItem() {
    const session = await auth();

    return <LostItemForm userId={session?.user?._id} />;
}
