import { useLocation } from "react-router-dom";
import { useEffect } from "react";

import { NotFoundPage } from "@/components/ui/not-found-page-2";

function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return <NotFoundPage />;
}

export default NotFound;
