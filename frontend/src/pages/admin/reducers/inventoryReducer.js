import { formatDateTimeLocal } from "../../../utils/formatters";

const createInitialPurchaseForm = () => ({
  supplierId: "",
  invoiceNumber: "",
  purchaseDate: formatDateTimeLocal(),
  notes: "",
  lines: [
    {
      presentationId: "",
      quantity: 1,
      unitCost: "",
      notes: "",
    },
  ],
});

const createInitialExitForm = () => ({
  presentationId: "",
  quantity: 1,
  reason: "",
  reference: "",
  notes: "",
});

export const initialInventoryState = {
  inventory: [],
  loading: true,
  error: "",
  searchTerm: "",

  movements: [],
  loadingMovements: false,
  movementError: "",
  movementType: "TODOS",
  movementSearch: "",

  suppliers: [],
  supplierError: "",

  showPurchaseModal: false,
  savingPurchase: false,
  purchaseMessage: "",
  purchaseError: "",
  purchaseForm: createInitialPurchaseForm(),

  showExitModal: false,
  savingExit: false,
  exitMessage: "",
  exitError: "",
  exitForm: createInitialExitForm(),
};

export function inventoryReducer(state, action) {
  switch (action.type) {
    case "SET_INVENTORY":
      return {
        ...state,
        inventory: action.payload,
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };


    case "SET_SEARCH_TERM":
      return {
        ...state,
        searchTerm: action.payload,
      };

    case "SET_MOVEMENTS":
      return {
        ...state,
        movements: action.payload,
      };

    case "SET_LOADING_MOVEMENTS":
      return {
        ...state,
        loadingMovements: action.payload,
      };

    case "SET_MOVEMENT_ERROR":
      return {
        ...state,
        movementError: action.payload,
      };

    case "SET_MOVEMENT_TYPE":
      return {
        ...state,
        movementType: action.payload,
      };

    case "SET_MOVEMENT_SEARCH":
      return {
        ...state,
        movementSearch: action.payload,
      };

    case "SET_SUPPLIERS":
      return {
        ...state,
        suppliers: action.payload,
      };

      case "SET_SUPPLIER_ERROR":
        return {
            ...state,
            supplierError: action.payload,
        };

    case "OPEN_PURCHASE_MODAL":
      return {
        ...state,
        showPurchaseModal: true,
        purchaseError: "",
        purchaseMessage: "",
      };

    case "CLOSE_PURCHASE_MODAL":
      return {
        ...state,
        showPurchaseModal: false,
      };

    case "SET_SAVING_PURCHASE":
      return {
        ...state,
        savingPurchase: action.payload,
      };

    case "SET_PURCHASE_MESSAGE":
      return {
        ...state,
        purchaseMessage: action.payload,
      };

    case "SET_PURCHASE_ERROR":
      return {
        ...state,
        purchaseError: action.payload,
      };

    case "UPDATE_PURCHASE_FORM":
      return {
        ...state,
        purchaseForm: {
          ...state.purchaseForm,
          [action.field]: action.value,
        },
      };

    case "UPDATE_PURCHASE_LINE":
      return {
        ...state,
        purchaseForm: {
          ...state.purchaseForm,
          lines: state.purchaseForm.lines.map((line, index) =>
            index === action.index
              ? {
                  ...line,
                  [action.field]: action.value,
                }
              : line
          ),
        },
      };

    case "ADD_PURCHASE_LINE":
      return {
        ...state,
        purchaseForm: {
          ...state.purchaseForm,
          lines: [
            ...state.purchaseForm.lines,
            {
              presentationId: "",
              quantity: 1,
              unitCost: "",
              notes: "",
            },
          ],
        },
      };

    case "REMOVE_PURCHASE_LINE":
      return {
        ...state,
        purchaseForm: {
          ...state.purchaseForm,
          lines: state.purchaseForm.lines.filter(
            (_, index) => index !== action.index
          ),
        },
      };

    case "RESET_PURCHASE_FORM":
      return {
        ...state,
        purchaseForm: createInitialPurchaseForm(),
      };

    case "OPEN_EXIT_MODAL":
      return {
        ...state,
        showExitModal: true,
        exitError: "",
        exitMessage: "",
      };

    case "CLOSE_EXIT_MODAL":
      return {
        ...state,
        showExitModal: false,
      };

    case "SET_SAVING_EXIT":
      return {
        ...state,
        savingExit: action.payload,
      };

    case "SET_EXIT_MESSAGE":
      return {
        ...state,
        exitMessage: action.payload,
      };

    case "SET_EXIT_ERROR":
      return {
        ...state,
        exitError: action.payload,
      };

    case "UPDATE_EXIT_FORM":
      return {
        ...state,
        exitForm: {
          ...state.exitForm,
          [action.field]: action.value,
        },
      };

    case "RESET_EXIT_FORM":
      return {
        ...state,
        exitForm: createInitialExitForm(),
        exitError: "",
        exitMessage: "",
      };

    default:
      return state;
  }
}