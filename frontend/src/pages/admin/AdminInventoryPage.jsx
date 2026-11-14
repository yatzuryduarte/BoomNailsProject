
import { useMemo, useReducer } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { initialInventoryState, inventoryReducer, } from "./reducers/inventoryReducer";
import InventoryTable from "./components/inventory/InventoryTable";
import InventoryMovements from "./components/inventory/InventoryMovements";
import PurchaseModal from "./components/inventory/PurchaseModal";
import ExitModal from "./components/inventory/ExitModal";
import useInventoryData from "../../hooks/useInventoryData";
import useInventoryActions from "../../hooks/useInventoryActions";

import AdminSidebar from "./AdminSidebar";
import "./components/ui/AdminCommon.css";
import "./AdminInventoryPage.css";
import AdminTopBar from "./components/ui/AdminTopBar";
import InventoryStats from "./components/inventory/InventoryStats";


function AdminInventoryPage() {
    const { logout } = useAdminAuth();

    const [state, dispatch] = useReducer(
      inventoryReducer,
      initialInventoryState
    );

    const {
      loadInventory,
      loadMovements,
    } = useInventoryData(dispatch);

const {
  inventory,
  loading,
  error,
  searchTerm,
  movements,
  loadingMovements,
  movementType,
  movementSearch,
  suppliers,
  showPurchaseModal,
  savingPurchase,
  purchaseError,
  purchaseForm,
  showExitModal,
  savingExit,
  exitError,
  exitForm,
} = state;

const {
  handlePurchaseFieldChange,
  addPurchaseLine,
  handlePurchaseLineChange,
  removePurchaseLine,
  handleExitFieldChange,
  resetExitForm,
  handleRegisterPurchase,
  handleRegisterExit,
} = useInventoryActions({
  dispatch,
  purchaseForm,
  exitForm,
  inventory,
  loadInventory,
  loadMovements,
});


  

  const filteredInventory = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return inventory;

    return inventory.filter((item) =>
      [
        item.productId,
        item.presentationId,
        item.reference,
        item.productName,
        item.categoryName,
        item.presentationName,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [inventory, searchTerm]);

  const filteredMovements = useMemo(() => {
    const term = movementSearch.trim().toLowerCase();

        return movements.filter((movement) => {
            const matchesType =
            movementType === "TODOS" ||
            movement.tipoMovimiento === movementType;

            const matchesSearch =
            !term ||
            [
                movement.producto,
                movement.presentacion,
                movement.motivo,
                movement.usuario,
                movement.documentoReferencia,
            ]
                .filter(Boolean)
                .some((value) =>
                String(value).toLowerCase().includes(term)
                );

            return matchesType && matchesSearch;
        });
        }, [movements, movementType, movementSearch]);

   const imageBaseUrl =
    (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");

  return (
    <main className="bn-orders-layout">
      <AdminSidebar />

      <div className="bn-payments-content">
        <AdminTopBar
        section="Inventario"
        onLogout={logout}
        />

        <section className="bn-dashboard">
          <div className="bn-page-heading">
            <div>
              <p className="bn-eyebrow">CENTRO DE CONTROL</p>
              <h1>Gestión de inventario.</h1>
              <p className="bn-muted">
                Consulta las existencias y controla el inventario
                de todas las presentaciones de Boom Nails.
              </p>
            </div>

            <div className="bn-inventory-actions">
                <button
                    className="bn-refresh-button"
                    onClick={() => {
                    dispatch({
                        type: "SET_PURCHASE_ERROR",
                        payload: "",
                    });

                    dispatch({
                        type: "SET_PURCHASE_MESSAGE",
                        payload: "",
                    });

                    dispatch({
                        type: "OPEN_PURCHASE_MODAL",
                    });
                    }}
                    >
                    + Registrar entrada
                    </button>

                    <button
                    className="bn-refresh-button"
                    onClick={() => {
                    resetExitForm();

                    dispatch({
                        type: "OPEN_EXIT_MODAL",
                    });
                    }}
                    >
                    − Registrar salida
                </button>

                <button
                    className="bn-refresh-button"
                    onClick={loadInventory}
                    disabled={loading}
                >
                    ↻ <span>Actualizar</span>
                </button>
            </div>
          </div>

          {error && (
            <div className="bn-error-banner" role="alert">
              {error}
            </div>
          )}

            <InventoryStats inventory={inventory} />

          <InventoryTable
            filteredInventory={filteredInventory}
            inventory={inventory}
            loading={loading}
            searchTerm={searchTerm}
            dispatch={dispatch}
            imageBaseUrl={imageBaseUrl}
          />

                  {/* HISTORIAL DE MOVIMIENTOS */}
            <InventoryMovements
              filteredMovements={filteredMovements}
              movements={movements}
              loadingMovements={loadingMovements}
              movementSearch={movementSearch}
              movementType={movementType}
              dispatch={dispatch}
            />

        </section>
        <PurchaseModal
          showPurchaseModal={showPurchaseModal}
          dispatch={dispatch}
          purchaseError={purchaseError}
          purchaseForm={purchaseForm}
          suppliers={suppliers}
          inventory={inventory}
          handleRegisterPurchase={handleRegisterPurchase}
          handlePurchaseFieldChange={handlePurchaseFieldChange}
          addPurchaseLine={addPurchaseLine}
          removePurchaseLine={removePurchaseLine}
          handlePurchaseLineChange={handlePurchaseLineChange}
          savingPurchase={savingPurchase}
        />


            <ExitModal
              showExitModal={showExitModal}
              dispatch={dispatch}
              exitError={exitError}
              exitForm={exitForm}
              inventory={inventory}
              handleRegisterExit={handleRegisterExit}
              handleExitFieldChange={handleExitFieldChange}
              savingExit={savingExit}
            />



      </div>
    </main>
  );
}

export default AdminInventoryPage;
