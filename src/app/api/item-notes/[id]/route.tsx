import { auth } from "@/auth";
import ItemNote from "@/model/ItemNote";

export async function PATCH(
    request: Request,
    {
        params,
    }: {
        params: Promise<{ id: string }>;
    },
) {
    const session = await auth();

    if (!session?.user?._id) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { note } = await request.json();

    const { id } = await params;

    const updated = await ItemNote.findOneAndUpdate(
        {
            _id: id,
            user: session.user._id,
            deletedAt: null,
        },
        {
            note,
            editedAt: new Date(),
        },
        {
            new: true,
        },
    );

    if (!updated) {
        return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json(updated);
}

export async function DELETE(
    request: Request,
    {
        params,
    }: {
        params: Promise<{ id: string }>;
    },
) {
    const session = await auth();

    if (!session?.user?._id) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const deleted = await ItemNote.findOneAndUpdate(
        {
            _id: id,
            user: session.user._id,
        },
        {
            deletedAt: new Date(),
        },
        {
            new: true,
        },
    );

    if (!deleted) {
        return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({
        success: true,
    });
}
