"use client";

import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

interface SearchBarProps<T extends Record<string, unknown>> {
    placeholder?: string;
    items: T[];
    setFilteredItems: (items: T[]) => void;
    searchableFields: (keyof T)[];
}

export default function SearchBar<T extends Record<string, unknown>>({
    placeholder,
    items,
    setFilteredItems,
    searchableFields,
}: SearchBarProps<T>) {
    const [searchTerm, setSearchTerm] = useState<string>("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        filterItems(searchTerm.toLowerCase());
    };

    const clearSearch = () => {
        setSearchTerm("");
        filterItems("");
    };

    const filterItems = (term: string) => {
        const filtered = items.filter((item) => {
            return searchableFields.some((field) => {
                const value = item[field];
                return (
                    typeof value === "string" &&
                    value.toLowerCase().includes(term)
                );
            });
        });

        setFilteredItems(filtered);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="items-center flex relative w-full"
        >
            <input
                type="text"
                name="searchTerm"
                placeholder={placeholder}
                value={searchTerm}
                onChange={handleChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:border-buzz-gold/20 focus:ring-2 focus:ring-buzz-gold/20 focus:outline-none"
            />
            <div className="absolute right-1.5 flex items-center gap-2">
                {searchTerm && (
                    <IoClose
                        className="cursor-pointer text-gray-500 hover:text-gray-800 transition-all"
                        size={20}
                        title="Clear"
                        onClick={clearSearch}
                    />
                )}
                <button
                    type="submit"
                    className="p-2 w-8 h-8 bg-buzz-gold text-white rounded-full hover:bg-buzz-gold/80"
                >
                    <FaSearch />
                </button>
            </div>
        </form>
    );
}