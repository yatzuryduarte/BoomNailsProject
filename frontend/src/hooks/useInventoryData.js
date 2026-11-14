import { useCallback, useEffect } from "react";
import { apiRequest } from "../services/api";

function useInventoryData(dispatch) {
  const loadInventory = useCallback(async () => {
    dispatch({
      type: "SET_LOADING",
      payload: true,
    });

    dispatch({
      type: "SET_ERROR",
      payload: "",
    });

    try {
      const data = await apiRequest("/admin/inventory");

      dispatch({
        type: "SET_INVENTORY",
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload:
          error.message || "No se pudo conectar con el servidor.",
      });
    } finally {
      dispatch({
        type: "SET_LOADING",
        payload: false,
      });
    }
  }, [dispatch]);

  const loadSuppliers = useCallback(async () => {
    dispatch({
      type: "SET_SUPPLIER_ERROR",
      payload: "",
    });

    try {
      const data = await apiRequest("/admin/suppliers");

      dispatch({
        type: "SET_SUPPLIERS",
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: "SET_SUPPLIER_ERROR",
        payload:
          error.message || "Error al cargar proveedores.",
      });
    }
  }, [dispatch]);

  const loadMovements = useCallback(async () => {
    dispatch({
      type: "SET_LOADING_MOVEMENTS",
      payload: true,
    });

    dispatch({
      type: "SET_MOVEMENT_ERROR",
      payload: "",
    });

    try {
      const data = await apiRequest(
        "/admin/inventory/movements"
      );

      dispatch({
        type: "SET_MOVEMENTS",
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: "SET_MOVEMENT_ERROR",
        payload:
          error.message || "Error al cargar movimientos.",
      });
    } finally {
      dispatch({
        type: "SET_LOADING_MOVEMENTS",
        payload: false,
      });
    }
  }, [dispatch]);

  useEffect(() => {
    loadInventory();
    loadSuppliers();
    loadMovements();
  }, [loadInventory, loadSuppliers, loadMovements]);

  return {
    loadInventory,
    loadSuppliers,
    loadMovements,
  };
}

export default useInventoryData;