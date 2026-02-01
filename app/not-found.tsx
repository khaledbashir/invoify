import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="text-center space-y-6">
                <h1 className="text-6xl font-bold text-[#0A52EF]">404</h1>
                <h2 className="text-2xl text-zinc-300">Page Not Found</h2>
                <p className="text-zinc-500">The page you're looking for doesn't exist.</p>
                <Link 
                    href="/projects" 
                    className="inline-block px-6 py-3 bg-[#0A52EF] text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Go to Projects
                </Link>
            </div>
        </div>
    );
}
