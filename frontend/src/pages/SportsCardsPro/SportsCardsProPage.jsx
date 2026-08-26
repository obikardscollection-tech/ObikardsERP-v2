import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
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
    singleCardSyncing,
    currentStatus,
    errorMessage,
    singleCardMessage,
    singleCardError,
    isDialogOpen,
    snackbar,
    handleOpenDialog,
    handleCloseDialog,
    handleCloseSnackbar,
    startSynchronization,
    handleSyncSingleCard,
  } = useSportsCardsPro();

  const [productId, setProductId] = useState("");

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 overflow-x-hidden bg-slate-100 p-4 sm:p-6 xl:p-8">
        <Container maxWidth="xl" disableGutters>
          <Stack spacing={3}>
            <SportsCardsProHeader onSyncNow={handleOpenDialog} syncing={syncing} />

            {loading && !statistics ? <CircularProgress size={28} /> : null}

            {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6">Synchronisation d'une carte unique</Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                    <TextField
                      label="ID produit SportsCardsPro"
                      value={productId}
                      onChange={(event) => setProductId(event.target.value)}
                      fullWidth
                      size="small"
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={singleCardSyncing || !productId.trim()}
                      onClick={() => handleSyncSingleCard({ productId: productId.trim() })}
                    >
                      {singleCardSyncing ? "Synchronisation..." : "Synchroniser"}
                    </Button>
                  </Stack>

                  {singleCardMessage ? <Alert severity="success">{singleCardMessage}</Alert> : null}
                  {singleCardError ? <Alert severity="error">{singleCardError}</Alert> : null}
                </Stack>
              </CardContent>
            </Card>

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
