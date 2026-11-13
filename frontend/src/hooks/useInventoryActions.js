import { useCallback } from "react";
import { apiRequest } from "../services/api";

function useInventoryActions({
  dispatch,
  purchaseForm,
  exitForm,
  inventory,
  loadInventory,
  loadMovements,
}) {
  const handlePurchaseFieldChange = useCallback(
    (event) => {
      const { name, value } = event.target;

      dispatch({
        type: "UPDATE_PURCHASE_FORM",
        field: name,
        value,
      });
    },
    [dispatch]
  );

  const addPurchaseLine = useCallback(() => {
    dispatch({
      type: "ADD_PURCHASE_LINE",
    });
  }, [dispatch]);

  const handlePurchaseLineChange = useCallback(
    (index, field, value) => {
      dispatch({
        type: "UPDATE_PURCHASE_LINE",
        index,
        field,
        value,
      });
    },
    [dispatch]
  );

  const removePurchaseLine = useCallback(
    (index) => {
      dispatch({
        type: "REMOVE_PURCHASE_LINE",
        index,
      });
    },
    [dispatch]
  );

  const handleExitFieldChange = useCallback(
    (event) => {
      const { name, value } = event.target;

      dispatch({
        type: "UPDATE_EXIT_FORM",
        field: name,
        value,
      });
    },
    [dispatch]
  );

  const resetExitForm = useCallback(() => {
    dispatch({
      type: "RESET_EXIT_FORM",
    });
  }, [dispatch]);

  const handleRegisterPurchase = useCallback(
    async (event) => {
      event.preventDefault();

      dispatch({
        type: "SET_PURCHASE_ERROR",
        payload: "",
      });

      dispatch({
        type: "SET_PURCHASE_MESSAGE",
        payload: "",
      });

      if (!purchaseForm.supplierId) {
        dispatch({
          type: "SET_PURCHASE_ERROR",
          payload: "Selecciona un proveedor.",
        });
        return;
      }

      if (purchaseForm.lines.length === 0) {
        dispatch({
          type: "SET_PURCHASE_ERROR",
          payload: "Agrega al menos un producto.",
        });
        return;
      }

      const invalidLine = purchaseForm.lines.some(
        (line) =>
          !line.presentationId ||
          Number(line.quantity) <= 0 ||
          line.unitCost === "" ||
          Number(line.unitCost) < 0
      );

      if (invalidLine) {
        dispatch({
          type: "SET_PURCHASE_ERROR",
          payload:
            "Verifica que cada producto tenga presentación, cantidad y costo válidos.",
        });
        return;
      }

      dispatch({
        type: "SET_SAVING_PURCHASE",
        payload: true,
      });

      try {
        const data = await apiRequest(
          "/admin/inventory/purchases",
          {
            method: "POST",
            body: JSON.stringify({
              supplierId: Number(purchaseForm.supplierId),
              invoiceNumber: purchaseForm.invoiceNumber,
              purchaseDate: purchaseForm.purchaseDate,
              notes: purchaseForm.notes,
              lines: purchaseForm.lines.map((line) => ({
                presentationId: Number(line.presentationId),
                quantity: Number(line.quantity),
                unitCost: Number(line.unitCost),
                notes: line.notes,
              })),
            }),
          }
        );

        dispatch({
          type: "SET_PURCHASE_MESSAGE",
          payload: `Compra registrada correctamente. Número de compra: ${data.idCompra}`,
        });

        dispatch({
          type: "CLOSE_PURCHASE_MODAL",
        });

        dispatch({
          type: "RESET_PURCHASE_FORM",
        });

        await loadInventory();
        await loadMovements();
      } catch (err) {
        dispatch({
          type: "SET_PURCHASE_ERROR",
          payload:
            err.message || "Error al registrar la compra.",
        });
      } finally {
        dispatch({
          type: "SET_SAVING_PURCHASE",
          payload: false,
        });
      }
    },
    [
      dispatch,
      purchaseForm,
      loadInventory,
      loadMovements,
    ]
  );

  const handleRegisterExit = useCallback(
    async (event) => {
      event.preventDefault();

      dispatch({
        type: "SET_EXIT_ERROR",
        payload: "",
      });

      dispatch({
        type: "SET_EXIT_MESSAGE",
        payload: "",
      });

      if (!exitForm.presentationId) {
        dispatch({
          type: "SET_EXIT_ERROR",
          payload: "Selecciona una presentación.",
        });
        return;
      }

      if (
        !Number.isInteger(Number(exitForm.quantity)) ||
        Number(exitForm.quantity) <= 0
      ) {
        dispatch({
          type: "SET_EXIT_ERROR",
          payload:
            "La cantidad debe ser un número entero mayor que cero.",
        });
        return;
      }

      if (!exitForm.reason) {
        dispatch({
          type: "SET_EXIT_ERROR",
          payload: "Selecciona el motivo de la salida.",
        });
        return;
      }

      const selectedItem = inventory.find(
        (item) =>
          item.presentationId === Number(exitForm.presentationId)
      );

      if (!selectedItem) {
        dispatch({
          type: "SET_EXIT_ERROR",
          payload:
            "No se encontró la presentación seleccionada.",
        });
        return;
      }

      if (Number(exitForm.quantity) > selectedItem.stock) {
        dispatch({
          type: "SET_EXIT_ERROR",
          payload: `Stock insuficiente. Disponibles: ${selectedItem.stock} unidades.`,
        });
        return;
      }

      dispatch({
        type: "SET_SAVING_EXIT",
        payload: true,
      });

      try {
        const data = await apiRequest(
          "/admin/inventory/exits",
          {
            method: "POST",
            body: JSON.stringify({
              presentationId: Number(exitForm.presentationId),
              quantity: Number(exitForm.quantity),
              reason: exitForm.reason,
              reference: exitForm.reference,
              notes: exitForm.notes,
            }),
          }
        );

        dispatch({
          type: "SET_EXIT_MESSAGE",
          payload: `Salida registrada correctamente. Movimiento: ${data.idMovimiento}`,
        });

        dispatch({
          type: "CLOSE_EXIT_MODAL",
        });

        resetExitForm();

        await loadInventory();
        await loadMovements();
      } catch (err) {
        dispatch({
          type: "SET_EXIT_ERROR",
          payload:
            err.message || "Error al registrar la salida.",
        });
      } finally {
        dispatch({
          type: "SET_SAVING_EXIT",
          payload: false,
        });
      }
    },
    [
      dispatch,
      exitForm,
      inventory,
      resetExitForm,
      loadInventory,
      loadMovements,
    ]
  );

  return {
    handlePurchaseFieldChange,
    addPurchaseLine,
    handlePurchaseLineChange,
    removePurchaseLine,
    handleExitFieldChange,
    resetExitForm,
    handleRegisterPurchase,
    handleRegisterExit,
  };
}

export default useInventoryActions;