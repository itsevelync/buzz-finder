import { useState } from "react";

interface UsePaginationProps {
    totalItems: number;
    itemsPerPage: number;
}

export function usePagination({ totalItems, itemsPerPage }: UsePaginationProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const nextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
    const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
    const goToPage = (page: number) => setCurrentPage(page);

    const generatePageNumbers = () => {
        const pages: (number | string)[] = [];

        const leftSiblingIndex = Math.max(currentPage - 1, 1);
        const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

        const shouldShowLeftDots = leftSiblingIndex > 2;
        const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
            return pages;
        }

        if (!shouldShowLeftDots && shouldShowRightDots) {
            for (let i = 1; i <= 3; i++) pages.push(i);
            pages.push("...");
            pages.push(totalPages);
        } else if (shouldShowLeftDots && !shouldShowRightDots) {
            pages.push(1);
            pages.push("...");
            for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i);
        } else if (shouldShowLeftDots && shouldShowRightDots) {
            pages.push(1);
            pages.push("...");
            pages.push(currentPage);
            pages.push("...");
            pages.push(totalPages);
        }

        return pages;
    };

    return {
        currentPage,
        totalPages,
        startIndex,
        endIndex,
        nextPage,
        prevPage,
        goToPage,
        generatePageNumbers,
    };
}
