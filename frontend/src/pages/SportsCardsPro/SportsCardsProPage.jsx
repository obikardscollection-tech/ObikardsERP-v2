import { Alert, CircularProgress, Container, Stack } from "@mui/material";
import Sidebar from "../../components/layout/Sidebar";
import SportsCardsProHeader from "../../components/SportsCardsPro/SportsCardsProHeader";
import SportsCardsProOverview from "../../components/SportsCardsPro/SportsCardsProOverview";
import SportsCardsProStatistics from "../../components/SportsCardsPro/SportsCardsProStatistics";
import SportsCardsProSyncCard from "../../components/SportsCardsPro/SportsCardsProSyncCard";
import SportsCardsProImportHistory from "../../components/SportsCardsPro/SportsCardsProImportHistory";
import SportsCardsProImportErrors from "../../components/SportsCardsPro/SportsCardsProImportErrors";
import SportsCardsProProgressDialog from "../../components/SportsCardsPro/SportsCardsProProgressDialog";
import useSportsCardsPro from "../../hooks/useSportsCardsPro";

export default function SportsCardsProPage() {
  const {
    statistics,
    jobs,
    errors,
    loading,
    refreshing,
    syncing,
    currentStatus,
    errorMessage,
    isDialogOpen,
    snackbar,
    handleOpenDialog,
    handleCloseDialog,
    handleCloseSnackbar,
    startSynchronization,
  } = useSportsCardsPro();

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 overflow-x-hidden bg-slate-100 p-4 sm:p-6 xl:p-8">
        <Container maxWidth="xl" disableGutters>
          <Stack spacing={3}>
            <SportsCardsProHeader onSyncNow={handleOpenDialog} syncing={syncing} />

            {loading ? <CircularProgress /> : null}

            {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

            <SportsCardsProOverview statistics={statistics} status={currentStatus} />
            <SportsCardsProStatistics statistics={statistics} />
            <SportsCardsProSyncCard
              status={currentStatus}
              lastExecution={statistics?.lastRunAt}
              syncing={syncing}
              onOpenDialog={handleOpenDialog}
            />
            <SportsCardsProImportHistory rows={jobs} loading={loading || refreshing} />
            <SportsCardsProImportErrors rows={errors} loading={loading || refreshing} />
          </Stack>
        </Container>
      </main>

      <SportsCardsProProgressDialog
        open={isDialogOpen}
        syncing={syncing}
        snackbar={snackbar}
        onClose={handleCloseDialog}
        onConfirm={startSynchronization}
        onCloseSnackbar={handleCloseSnackbar}
      />
    </div>
  );
}
