import { Link } from "react-router";
import { House, ArrowBigLeft  } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-base-100 min-h-screen flex items-center justify-center">
      <div className="container mx-auto flex items-center justify-center">
        <div className="card bg-base-200 w-full max-w-xl p-8 text-center">
          <div className="mb-6">
            <h1 className="text-4xl sm:text-5xl font-bold mb-2">404</h1>
            <h2 className="text-2xl sm:text-3xl font-semibold">
              Page Not Found
            </h2>
            <p className="opacity-70 mt-2">
              We couldn't find the page you're looking for. It may have been
              moved or removed.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/" className="btn btn-primary b ">
              <House className="size-4 mr-2" />
              Go Home
            </Link>

            <Link to={-1} className="btn btn-outline ">
                <ArrowBigLeft  className="size-4 mr-2" />
              Go Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
