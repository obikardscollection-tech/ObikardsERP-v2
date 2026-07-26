import { Chip } from "@mui/material";

const STATUS_UI = {
  SUCCESS: {
    label: "Succes",
    color: "success",
  },
  FAILED: {
    label: "Echec",
    color: "error",
  },
  RUNNING: {
    label: "En cours",
    color: "warning",
  },
  PENDING: {
    label: "En attente",
    color: "default",
  },
  CANCELLED: {
    label: "Annule",
    color: "default",
  },
};

export default function SportsCardsProStatusChip({ status }) {
  const config = STATUS_UI[status] || STATUS_UI.PENDING;

  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      variant={status === "RUNNING" ? "filled" : "outlined"}
    />
  );
}
