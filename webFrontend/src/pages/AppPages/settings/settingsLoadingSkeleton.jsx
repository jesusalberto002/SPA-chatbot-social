export default function SettingsLoadingSkeleton() {
    return (
        <div className="space-y-6 w-full animate-pulse">
            {/* Title Skeleton */}
            <div className="flex justify-center mb-6">
            <div className="h-8 w-48 rounded-lg bg-[var(--interactive-hover)]" />
            </div>

            {/* Card 1 Skeleton */}
            <div className="rounded-xl p-6 border w-full" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-5 h-5 rounded-full bg-[var(--interactive-hover)]" />
                <div className="h-6 w-40 rounded bg-[var(--interactive-hover)]" />
            </div>
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center py-3 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                    <div className="space-y-2">
                    <div className="h-3 w-20 rounded bg-[var(--interactive-hover)]" />
                    <div className="h-5 w-32 rounded bg-[var(--interactive-hover)]" />
                    </div>
                    <div className="w-5 h-5 rounded bg-[var(--interactive-hover)]" />
                </div>
                ))}
            </div>
            </div>

            {/* Card 2 Skeleton */}
            <div className="rounded-xl p-6 border w-full" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[var(--interactive-hover)]" />
                <div className="h-6 w-40 rounded bg-[var(--interactive-hover)]" />
                </div>
                <div className="h-8 w-24 rounded-lg bg-[var(--interactive-hover)]" />
            </div>
            <div className="h-10 w-32 rounded-full bg-[var(--interactive-hover)]" />
            </div>
        </div>
    );
}