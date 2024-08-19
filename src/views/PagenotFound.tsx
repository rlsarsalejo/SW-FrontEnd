import { Link } from 'react-router-dom'
function PagenotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-9xl font-extrabold text-gray-900 tracking-widest">404</h1>
        <div className="bg-blue-500 px-2 text-sm font-semibold rounded ">
          Page Not Found
        </div>
        <p className="text-gray-600 mt-4">
          Sorry, the page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-5 inline-block px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-md transition duration-300"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}

export default PagenotFound