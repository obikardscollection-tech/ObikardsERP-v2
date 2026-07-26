import { Paper, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("fr-FR");
}

const columns = [
  {
    field: "createdAt",
    headerName: "Date",
    minWidth: 190,
    flex: 1,
    valueGetter: (value) => formatDate(value),
  },
  {
    field: "providerCardId",
    headerName: "Provider Card ID",
    minWidth: 180,
    flex: 1,
    valueGetter: (value) => value || "-",
  },
  {
    field: "errorCode",
    headerName: "Error Code",
    minWidth: 140,
    flex: 1,
    valueGetter: (value) => value || "-",
  },
  {
    field: "message",
    headerName: "Message",
    minWidth: 280,
    flex: 2,
    valueGetter: (value) => value || "-",
  },
  {
    field: "lineNumber",
    headerName: "CSV Line",
    minWidth: 100,
    flex: 0.7,
    valueGetter: (value) => value || "-",
  },
];

export default function SportsCardsProImportErrors({ rows, loading }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Erreurs d'import
      </Typography>

      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id ?? `${row.marketImportJobId || "na"}-${row.lineNumber || "na"}-${row.createdAt || "na"}`}
        loading={loading}
        density="compact"
        autoHeight
        disableRowSelectionOnClick
        disableColumnMenu
        pageSizeOptions={[10, 25, 50]}
        localeText={{
          noRowsLabel: "Aucune erreur d'import.",
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
