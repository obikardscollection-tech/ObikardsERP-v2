import { Grid, Paper, Stack, Typography } from "@mui/material";
import SportsCardsProStatusChip from "./SportsCardsProStatusChip";
import formatDuration from "../../utils/formatDuration";
import { formatDateTime, formatNumber } from "../../utils/formatStatistics";

function StatItem({ label, value }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 700 }}>
        {value}
      </Typography>
    </Paper>
  );
}

export default function SportsCardsProOverview({ statistics, status }) {
  const lastJob = statistics?.lastJob || null;

  const items = [
    { label: "Derniere synchronisation", value: formatDateTime(statistics?.lastRunAt) },
    { label: "Dernier succes", value: formatDateTime(statistics?.lastSuccessAt) },
    { label: "Duree du dernier import", value: formatDuration(statistics?.lastImportDurationMs) },
    { label: "Imports totaux", value: formatNumber(statistics?.totalJobs) },
    { label: "Imports reussis", value: formatNumber(statistics?.successfulJobs) },
    { label: "Imports en echec", value: formatNumber(statistics?.failedJobs) },
  ];

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Vue d'ensemble
        </Typography>
        <SportsCardsProStatusChip status={status} />
      </Stack>

      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.label}>
            <StatItem label={item.label} value={item.value} />
          </Grid>
        ))}
      </Grid>

      {lastJob ? (
        <Typography variant="caption" sx={{ display: "block", color: "text.secondary", mt: 2 }}>
          Dernier statut job: {lastJob.status}
        </Typography>
      ) : null}
    </Paper>
  );
}
