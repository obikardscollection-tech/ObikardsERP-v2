import { Button, Paper, Stack, Typography } from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import SportsCardsProStatusChip from "./SportsCardsProStatusChip";
import { formatDateTime } from "../../utils/formatStatistics";

export default function SportsCardsProSyncCard({
  status,
  lastExecution,
  syncing,
  onOpenDialog,
}) {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between">
        <div>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Synchronisation
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            Derniere execution: {formatDateTime(lastExecution)}
          </Typography>
        </div>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <SportsCardsProStatusChip status={status} />
          <Button
            variant="contained"
            startIcon={<PlayArrowRoundedIcon />}
            onClick={onOpenDialog}
            disabled={syncing}
          >
            Lancer
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
