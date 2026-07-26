import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";

export default function SportsCardsProProgressDialog({
  open,
  syncing,
  snackbar,
  onClose,
  onConfirm,
  onCloseSnackbar,
}) {
  return (
    <>
      <Dialog open={open} onClose={syncing ? undefined : onClose} fullWidth maxWidth="sm">
        <DialogTitle>Synchronisation SportsCardsPro</DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
            <CircularProgress size={28} />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {syncing
                ? "Import en cours. Veuillez patienter, un seul lancement est autorise a la fois."
                : "Demarrer une synchronisation manuelle SportsCardsPro."}
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={syncing}>
            Annuler
          </Button>
          <Button variant="contained" onClick={onConfirm} disabled={syncing}>
            {syncing ? "Synchronisation..." : "Confirmer"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4500}
        onClose={onCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={onCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
