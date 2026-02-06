import ContentGrid from "@/components/content-grid"

export default function FavoritesPage() {
    return (
        <div className="flex-1 space-y-6">
            <div>
                <h1 className="text-lg font-semibold md:text-2xl">My Favorites</h1>
                <p className="text-muted-foreground text-sm">Here are the creations you've favorited.</p>
            </div>
            <ContentGrid />
        </div>
    )
}
