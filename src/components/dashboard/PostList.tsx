"use client";

import { LostItemPost } from "@/model/LostItemPost";
import LostItemCard from "./LostItemCard";
import { LuArrowLeft, LuArrowRight } from "react-icons/lu";
import { usePagination } from "@/hooks/usePagination";

const ITEMS_PER_PAGE = 12;

export default function PostList({
    lostItemPosts,
    columns = 1,
}: {
    lostItemPosts: LostItemPost[] | undefined;
    columns?: number;
}) {
    const {
        currentPage,
        totalPages,
        startIndex,
        endIndex,
        nextPage,
        prevPage,
        goToPage,
        generatePageNumbers,
    } = usePagination({
        totalItems: lostItemPosts?.length || 0,
        itemsPerPage: ITEMS_PER_PAGE,
    });

    if (!lostItemPosts || lostItemPosts.length === 0) {
        return (
            <p className="text-center text-gray-500 py-10">No posts found.</p>
        );
    }

    const paginatedPosts = lostItemPosts.slice(startIndex, endIndex);

    const gridColsClass =
        {
            1: "grid-cols-1",
            2: "grid-cols-1 md:grid-cols-2",
            3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        }[columns] || "grid-cols-1";

    return (
        <div className="w-full flex flex-col gap-6">
            <div
                className={`grid ${gridColsClass} gap-4 p-5 justify-items-center`}
            >
                {paginatedPosts.map((lostItemPost: LostItemPost) => (
                    <LostItemCard
                        key={lostItemPost._id.toString()}
                        lostItemPost={lostItemPost}
                        columns={columns}
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between w-full border-t border-gray-100 py-4 px-5">
                    <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className="flex items-center gap-2 px-4 py-2 border border-foreground/30 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        <LuArrowLeft /> Previous
                    </button>

                    <div className="hidden sm:flex items-center gap-1">
                        {generatePageNumbers().map((page, index) => {
                            if (page === "...") {
                                return (
                                    <span
                                        key={`dots-${index}`}
                                        className="px-3 py-2 text-sm text-gray-400 select-none"
                                    >
                                        ...
                                    </span>
                                );
                            }
                            const isCurrent = page === currentPage;
                            return (
                                <button
                                    key={`page-${page}`}
                                    onClick={() => goToPage(Number(page))}
                                    className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                                        isCurrent
                                            ? "bg-gray-100 text-gray-900 font-semibold"
                                            : "text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-2 px-4 py-2 border border-foreground/30 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Next <LuArrowRight />
                    </button>
                </div>
            )}
        </div>
    );
}
