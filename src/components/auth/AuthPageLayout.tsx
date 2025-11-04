import Image from "next/image";

interface AuthPageLayoutProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    bottomText: React.ReactNode;
}

export default function AuthPageLayout({
    title,
    subtitle = "",
    children,
    bottomText,
}: AuthPageLayoutProps) {
    return (
        <div className="flex flex-col sm:flex-row min-h-screen items-center p-3 m-auto max-w-6xl">
            <div className="page-container w-full sm:w-1/2 flex flex-col gap-3">
                <h2 className="text-3xl font-bold">{title}</h2>
                {subtitle && <p>{subtitle}</p>}
                {children}
                <p className="text-gray-700 text-center">{bottomText}</p>
            </div>
            <div className="w-full sm:w-1/2">
                <Image
                    src="/gt-map.png"
                    alt="GT Campus Map"
                    width={500}
                    height={700}
                />
            </div>
        </div>
    );
}
