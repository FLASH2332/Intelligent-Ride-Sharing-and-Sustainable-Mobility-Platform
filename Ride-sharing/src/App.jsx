export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center p-8 rounded-xl bg-gray-800 shadow-lg">
        <h1 className="text-4xl font-bold text-blue-400 mb-4">
          React + Tailwind 🚀
        </h1>
        <p className="text-gray-300">
          If this is styled, Tailwind is working correctly.
        </p>
        <button className="mt-6 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition">
          Test Button
        </button>
      </div>
    </div>
  );
}
