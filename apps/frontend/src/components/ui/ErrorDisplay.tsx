import { Alert, Box, Button, Typography } from "@mui/material";
import { ErrorOutline, Refresh } from "@mui/icons-material";
import { DEFAULT_ERROR_MESSAGE } from "../../constants";
import type { ApiError } from "../../types";

interface ErrorDisplayProps {
  error: ApiError | Error | string | null;
  onRetry?: () => void;
  showRetry?: boolean;
  variant?: "standard" | "filled" | "outlined";
}

export function ErrorDisplay({
  error,
  onRetry,
  showRetry = true,
  variant = "standard",
}: ErrorDisplayProps) {
  if (!error) return null;

  const getErrorMessage = (error: ErrorDisplayProps["error"]): string => {
    if (typeof error === "string") return error;
    if (error && typeof error === "object" && "message" in error) {
      return error.message;
    }
    return DEFAULT_ERROR_MESSAGE;
  };

  const getErrorCode = (
    error: ErrorDisplayProps["error"]
  ): string | undefined => {
    if (error && typeof error === "object" && "status" in error) {
      return `Error ${error.status}`;
    }
    return undefined;
  };

  const errorMessage = getErrorMessage(error);
  const errorCode = getErrorCode(error);

  return (
    <Box py={4}>
      <Alert
        severity="error"
        variant={variant}
        icon={<ErrorOutline />}
        sx={{ mb: showRetry ? 2 : 0 }}
      >
        <Box>
          {errorCode && (
            <Typography variant="body2" fontWeight="medium" mb={0.5}>
              {errorCode}
            </Typography>
          )}
          <Typography variant="body1">{errorMessage}</Typography>
        </Box>
      </Alert>

      {showRetry && onRetry && (
        <Box display="flex" justifyContent="center">
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={onRetry}
            size="small"
          >
            Try Again
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default ErrorDisplay;
