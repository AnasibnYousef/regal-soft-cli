import { buttonVariants } from "./components/ui/button";

export default function ErrorPage() {
  return (
    <div className="bg-white h-screen flex flex-col items-center justify-center">
      <div className="justify-center items-center gap-2 flex flex-col">
        <h1 className="text-9xl font-bold text-gray-800">404</h1>
        <p className="text-xl mt-4 text-gray-600">Oops! Page Not Found</p>
        <p className="pt-2 pb-4 text-gray-600">
          We are sorry, but the page you requested was not found
        </p>
        <a href="/" className={buttonVariants()}>
          Go to Homepage
        </a>
      </div>
    </div>
  );
}
