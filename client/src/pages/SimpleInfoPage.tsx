export function SimpleInfoPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-red-700 to-red-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-serif">{title}</h1>
          <p className="mt-2 text-white/90 max-w-2xl">This page will be completed soon.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="rounded-2xl border bg-white shadow-sm p-8 text-gray-700">
          <div className="text-gray-600">Content coming soon.</div>
        </div>
      </div>
    </div>
  );
}
