export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 flex items-center justify-center">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1e40af]"></div>
        <span className="text-lg text-muted-foreground">Loading invites...</span>
      </div>
    </div>
  )
}
