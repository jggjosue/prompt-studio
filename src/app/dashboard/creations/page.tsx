import ContentGrid from "@/components/content-grid"

export default function CreationsPage() {
    return (
        <div className="flex-1 space-y-6">
            <div>
                <h1 className="text-lg font-semibold md:text-2xl">My Creations</h1>
                <p className="text-muted-foreground text-sm">View and manage all your generated content.</p>
            </div>
            <ContentGrid />
        </div>
    )
}
