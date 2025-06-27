import { useAuthReady } from "./auth-provider";
import { Loader2 } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";

interface AuthLoadingWrapperProps {
  children: ReactNode;
  minLoadingTime?: number;
}

const AuthLoadingWrapper = ({
  children,
  minLoadingTime = 1000,
}: AuthLoadingWrapperProps) => {
  const { isAuthReady } = useAuthReady();
  const [showLoader, setShowLoader] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (isAuthReady) {
      // Start the fade out timer once auth is ready
      const fadeTimer = setTimeout(() => {
        setFadeOut(true);
      }, minLoadingTime - 300);

      // After min loading time, hide the loader completely
      const hideLoaderTimer = setTimeout(() => {
        setShowLoader(false);
      }, minLoadingTime);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideLoaderTimer);
      };
    }
  }, [isAuthReady, minLoadingTime]);

  return (
    <>
      {/* Loader overlay that fades out */}
      {showLoader && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center min-h-screen gap-4 bg-background transition-opacity duration-300 ease-in-out ${
            fadeOut ? "opacity-0" : "opacity-100"
          }`}
        >
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <div className="flex flex-col items-center">
            <span className="text-lg font-medium">Authenticating</span>
            <span className="text-sm text-muted-foreground animate-pulse">
              Please wait
            </span>
          </div>
        </div>
      )}

      {/* Content is always rendered, but initially hidden */}
      <div className={`animate-fadeIn ${showLoader ? "hidden" : "block"}`}>
        {children}
      </div>
    </>
  );
};

export default AuthLoadingWrapper;
