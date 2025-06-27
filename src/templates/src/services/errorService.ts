import { AxiosError } from "axios";
import { toast } from "sonner";

type ErrorResponse = { message: string };

export const handleApiError =
  (fallbackMessage: string) => (error: AxiosError<ErrorResponse>) => {
    const errorMessage =
      error.response?.data?.message || fallbackMessage + " - " + error.message;
    toast.error(errorMessage);
  };
