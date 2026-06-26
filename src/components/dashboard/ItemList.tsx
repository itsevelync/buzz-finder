"use client";

import { PlainItem } from "@/model/Item";
import FoundItemCard from "./FoundItemCard";
import { LuCompass, LuArrowLeft, LuArrowRight } from "react-icons/lu";
import { usePagination } from "@/hooks/usePagination";

const ITEMS_PER_PAGE = 12;

export default function ItemList({ items }: { items: PlainItem[] }) {
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
        totalItems: items?.length || 0,
        itemsPerPage: ITEMS_PER_PAGE,
    });

    if (!items || items.length === 0) {
        return (
            <div className="p-16 flex flex-col gap-4 items-center">
                <div className="rounded-full p-4 border-2 border-foreground/20">
                    <LuCompass size={60} />
                </div>
                <p className="text-lg">No found items</p>
            </div>
        );
    }

    const paginatedItems = items.slice(startIndex, endIndex);

    return (
        <div className="w-full flex flex-col gap-6">
            <div className="w-full p-5 m-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedItems.map((item: PlainItem) => (
                    <FoundItemCard
                        key={item._id}
                        item={item}
                        includeMapLink={true}
                    />
                ))}
            </div>

            {/* Pagination controls */}
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
