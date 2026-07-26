import { Grid, Paper, Typography } from "@mui/material";
import { formatNumber, mapStatisticsToKpis } from "../../utils/formatStatistics";

export default function SportsCardsProStatistics({ statistics }) {
  const kpis = mapStatisticsToKpis(statistics);

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Statistiques globales
      </Typography>

      <Grid container spacing={2}>
        {kpis.map((kpi) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={kpi.key}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {kpi.label}
              </Typography>
              <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 700 }}>
                {formatNumber(kpi.value)}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}
