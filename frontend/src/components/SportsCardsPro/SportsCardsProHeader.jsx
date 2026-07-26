import { Button, Stack, Typography } from "@mui/material";
import SyncIcon from "@mui/icons-material/Sync";

export default function SportsCardsProHeader({ onSyncNow, syncing }) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", md: "center" }}
      spacing={2}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        p: 3,
        backgroundColor: "background.paper",
      }}
    >
      <div>
        <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: 1.2 }}>
          Market Provider
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          SportsCardsPro
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          Supervisez les imports, statistiques et erreurs de synchronisation provider.
        </Typography>
      </div>

      <Button
        variant="contained"
        startIcon={<SyncIcon />}
        onClick={onSyncNow}
        disabled={syncing}
      >
        {syncing ? "Synchronisation..." : "Synchroniser maintenant"}
      </Button>
    </Stack>
  );
}
