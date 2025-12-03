export default function Loading() {
  const sidebarItems = [1, 2, 3, 4, 5]
  const factsItems = [1, 2, 3, 4]
  const sectionItems = [1, 2, 3]
  const paragraphItems = [1, 2, 3, 4]

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full px-4 py-4">
        <div className="lg:grid lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:gap-10">
          {/* Sidebar skeleton */}
          <aside className="hidden lg:block">
            <div className="sticky top-32 lg:top-[180px] space-y-4">
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="space-y-2">
                {sidebarItems.map((item) => (
                  <div
                    key={`sidebar-${item}`}
                    className="h-10 bg-gray-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            </div>
          </aside>

          <div className="space-y-8">
            {/* Hero skeleton */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="lg:flex lg:h-[400px]">
                <div className="w-full h-64 sm:h-80 lg:w-1/2 lg:h-full bg-gray-200 animate-pulse" />
                <div className="p-6 space-y-4 lg:w-1/2 lg:flex lg:flex-col lg:justify-center lg:p-12">
                  <div className="h-8 w-24 bg-[#b01c14]/20 rounded-lg animate-pulse" />
                  <div className="h-12 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 w-1/2 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            </div>

            {/* Quick facts skeleton */}
            <div className="rounded-2xl border border-gray-200/80 bg-white p-6">
              <div className="mb-5 flex items-center gap-3 border-b border-gray-200/80 pb-4">
                <div className="h-10 w-10 bg-[#b01c14]/10 rounded-lg animate-pulse" />
                <div className="space-y-2">
                  <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
              <div className="space-y-4">
                {factsItems.map((item) => (
                  <div
                    key={`fact-${item}`}
                    className="border-b border-gray-200/60 pb-4 last:border-0"
                  >
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-5 w-full bg-gray-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Content sections skeleton */}
            <div className="space-y-12">
              {sectionItems.map((sectionItem) => (
                <section key={`section-${sectionItem}`}>
                  <div className="mb-6 border-b border-gray-200 pb-3">
                    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    {paragraphItems.map((paragraphItem) => (
                      <div
                        key={`paragraph-${sectionItem}-${paragraphItem}`}
                        className="h-5 bg-gray-100 rounded animate-pulse"
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
