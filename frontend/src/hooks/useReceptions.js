import { useCallback, useEffect, useState } from "react";

import {
  createReception,
  deleteReception,
  getReception,
  getReceptions,
  updateReception,
} from "../services/receptionService";

export default function useReceptions() {
  const [receptions, setReceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReceptions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getReceptions();
      setReceptions(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les réceptions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReceptions();
  }, [loadReceptions]);

  async function addReception(payload) {
    await createReception(payload);
    await loadReceptions();
  }

  async function editReception(id, payload) {
    await updateReception(id, payload);
    await loadReceptions();
  }

  async function removeReception(id) {
    await deleteReception(id);
    await loadReceptions();
  }

  async function fetchReception(id) {
    return getReception(id);
  }

  return {
    receptions,
    loading,
    error,
    loadReceptions,
    addReception,
    editReception,
    removeReception,
    fetchReception,
  };
}
