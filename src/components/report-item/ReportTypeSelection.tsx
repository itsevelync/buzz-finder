// components/report-item/ReportTypeSelection.tsx
"use client";

import { useRouter } from "next/navigation";
import { LuSearch, LuPackage } from "react-icons/lu";

export default function ReportTypeSelection() {
    const router = useRouter();

    // Updates the URL parameter cleanly without a hard page reload
    const handleSelect = (type: "lost" | "found") => {
        router.push(`/report-item?type=${type}`);
    };

    return (
        <div className="min-h-full max-w-4xl mx-auto px-4 py-10 sm:px-8 sm:py-20 flex flex-col items-center justify-center gap-8">
            <div className="text-center max-w-xl px-4">
                <h1 className="text-4xl font-bold text-buzz-blue">
                    What would you like to report?
                </h1>
                <p className="text-foreground/70 mt-3 text-lg">
                    Select an option below.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mt-4">
                
                {/* OPTION 1: FOUND ITEM */}
                <button
                    onClick={() => handleSelect("found")}
                    className="group bg-white border border-gray-200 rounded-xl p-8 flex flex-col items-center text-center gap-4 hover:border-buzz-gold hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-buzz-gold"
                >
                    <div className="p-4 bg-amber-50 text-buzz-gold rounded-full group-hover:scale-110 transition-transform duration-200">
                        <LuPackage size={40} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold group-hover:text-buzz-blue transition-colors">
                            Found Item
                        </h3>
                        <p className="text-foreground/70 mt-2">
                            You discovered a lost item on or around campus.
                        </p>
                    </div>
                </button>

                {/* OPTION 2: LOST ITEM */}
                <button
                    onClick={() => handleSelect("lost")}
                    className="group bg-white border border-gray-200 rounded-xl p-8 flex flex-col items-center text-center gap-4 hover:border-buzz-blue hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-buzz-blue"
                >
                    <div className="p-4 bg-blue-50 text-buzz-blue rounded-full group-hover:scale-110 transition-transform duration-200">
                        <LuSearch size={40} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-semibold group-hover:text-buzz-blue transition-colors">
                            Lost Item
                        </h3>
                        <p className="text-foreground/70 mt-2">
                            You lost something and need help finding it.
                        </p>
                    </div>
                </button>

            </div>
        </div>
    );
}