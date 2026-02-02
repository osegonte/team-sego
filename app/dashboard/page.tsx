// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center max-w-md px-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Welcome to Team Sego
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Authentication is working. The tool is ready to be designed.
        </p>
        <div className="mt-8 pt-8 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Clean slate · No database tables · Ready for tool-first design
          </p>
        </div>
      </div>
    </div>
  )
}