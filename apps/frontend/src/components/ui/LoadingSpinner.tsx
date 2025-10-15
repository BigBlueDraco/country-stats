import { CircularProgress, Box, Typography } from "@mui/material";
import { LOADING_MESSAGE } from "../../constants";

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
}

export function LoadingSpinner({
  message = LOADING_MESSAGE,
  size = 40,
}: LoadingSpinnerProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
      py={4}
    >
      <CircularProgress size={size} />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

export default LoadingSpinner;
