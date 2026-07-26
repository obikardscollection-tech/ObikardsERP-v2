import { Paper, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SportsCardsProStatusChip from "./SportsCardsProStatusChip";
import formatDuration from "../../utils/formatDuration";

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("fr-FR");
}

function formatTime(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleTimeString("fr-FR");
}

const columns = [
  {
    field: "startedAtDate",
    headerName: "Date",
    width: 110,
    valueGetter: (_, row) => formatDate(row.startedAt),
  },
  {
    field: "startedAtTime",
    headerName: "Heure",
    width: 95,
    valueGetter: (_, row) => formatTime(row.startedAt),
  },
  {
    field: "durationMs",
    headerName: "Duree",
    width: 110,
    valueGetter: (_, row) => formatDuration(row.durationMs),
  },
  {
    field: "status",
    headerName: "Statut",
    width: 120,
    renderCell: (params) => <SportsCardsProStatusChip status={params.value} />,
  },
  { field: "totalRows", headerName: "Analysees", width: 110 },
  { field: "processedRows", headerName: "Traitees", width: 100 },
  { field: "skippedRows", headerName: "Ignorees", width: 100 },
  { field: "cardsCreated", headerName: "Creees", width: 95 },
  { field: "cardsUpdated", headerName: "Maj", width: 90 },
  { field: "providerCardsCreated", headerName: "Prov+", width: 90 },
  { field: "providerCardsUpdated", headerName: "ProvMaj", width: 100 },
  { field: "snapshotsCreated", headerName: "Snapshots", width: 105 },
  { field: "historyCreated", headerName: "Historique", width: 105 },
  { field: "errorsCount", headerName: "Erreurs", width: 90 },
];

export default function SportsCardsProImportHistory({ rows, loading }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Historique des imports
      </Typography>

      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id ?? `${row.startedAt || "na"}-${row.marketProviderId || "na"}`}
        loading={loading}
        density="compact"
        autoHeight
        disableRowSelectionOnClick
        disableColumnMenu
        pageSizeOptions={[10, 25, 50]}
        localeText={{
          noRowsLabel: "Aucun import disponible.",
        }}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
              page: 0,
            },
          },
        }}
        sx={{
          borderColor: "divider",
          minHeight: 280,
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#f8fafc",
          },
        }}
      />
    </Paper>
  );
}
