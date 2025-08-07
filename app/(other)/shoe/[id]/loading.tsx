export default function Loading() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-5 sm:px-6 sm:py-8 animate-pulse">
      <div className="h-6 w-32 bg-muted rounded mb-4 sm:mb-6" />{' '}
      {/* хлебные крошки */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 items-center">
        <div className="w-full max-w-[300px] h-[400px] sm:max-w-[450px] sm:h-[574px] bg-muted rounded mx-auto" />
        <div className="flex flex-col space-y-4">
          <div className="h-7 sm:h-8 w-2/3 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-1/2 bg-muted rounded" />
          <div className="flex gap-3 sm:gap-4">
            <div className="h-6 w-20 bg-muted rounded-full" />
            <div className="h-6 w-20 bg-muted rounded-full" />
          </div>
          <div className="h-8 sm:h-10 w-32 bg-muted rounded" />
        </div>
      </div>
    </main>
  );
}
