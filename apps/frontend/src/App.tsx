import { AppBar, Box, Toolbar, Typography } from "@mui/material";
import { CountryStatsTable, ErrorDisplay, LoadingSpinner } from "./components";
import { useGetCountryStats, useUpdateCountryStats } from "./hooks";

function App() {
  const { data, loading, error, refetch } = useGetCountryStats();
  useUpdateCountryStats();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppBar position="static" elevation={1} sx={{ backgroundColor: "white" }}>
        <Toolbar>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              flexGrow: 1,
              color: "text.primary",
              fontWeight: "bold",
            }}
          >
            Country Statistics Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {loading && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexGrow={1}
          >
            <LoadingSpinner />
          </Box>
        )}

        {error && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexGrow={1}
            px={2}
          >
            <ErrorDisplay error={error} onRetry={refetch} showRetry={true} />
          </Box>
        )}

        {data && !loading && !error && (
          <Box
            sx={{
              flexGrow: 1,
              p: 2,
              overflow: "auto",
            }}
          >
            <CountryStatsTable data={data} />
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default App;
