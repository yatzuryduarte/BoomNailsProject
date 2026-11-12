import {
  createContext,
  useContext,
  useEffect,
  useReducer,
} from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "boom-nails-cart";

function loadCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_TO_CART": {
      const {
        product,
        presentation,
        quantity,
      } = action.payload;

      const productId = product.id;
      const presentationId = presentation.id;
      const price = Number(presentation.retailPrice);
      const stock = Number(presentation.stock);

      const existing = state.find(
        (item) =>
          item.productId === productId &&
          item.presentationId === presentationId
      );

      const currentQuantity = existing?.quantity || 0;
      const newQuantity = currentQuantity + quantity;

      if (newQuantity > stock) {
        return state;
      }

      if (existing) {
        return state.map((item) =>
          item.productId === productId &&
          item.presentationId === presentationId
            ? {
                ...item,
                quantity: newQuantity,
              }
            : item
        );
      }

      return [
        ...state,
        {
          productId,
          presentationId,
          reference: product.reference,
          name: product.name,
          description: product.description,
          presentationName: presentation.name,
          size: presentation.size,
          price,
          stock,
          imageUrl: product.imageUrl || null,
          quantity,
        },
      ];
    }

    case "UPDATE_QUANTITY": {
      const {
        productId,
        presentationId,
        quantity,
      } = action.payload;

      const newQuantity = Number(quantity);

      if (
        !Number.isInteger(newQuantity) ||
        newQuantity < 1
      ) {
        return state;
      }

      return state.map((item) => {
        if (
          item.productId !== productId ||
          item.presentationId !== presentationId
        ) {
          return item;
        }

        return {
          ...item,
          quantity: Math.min(
            newQuantity,
            item.stock
          ),
        };
      });
    }

    case "REMOVE_FROM_CART": {
      const {
        productId,
        presentationId,
      } = action.payload;

      return state.filter(
        (item) =>
          item.productId !== productId ||
          item.presentationId !== presentationId
      );
    }

    case "CLEAR_CART":
      return [];

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cartItems, dispatch] = useReducer(
    cartReducer,
    [],
    loadCart
  );

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(cartItems)
    );
  }, [cartItems]);

  function addToCart(
    product,
    presentation,
    quantity = 1
  ) {
    const price = Number(
      presentation.retailPrice
    );

    const stock = Number(
      presentation.stock
    );

    const requestedQuantity = Number(quantity);

    // Validamos ANTES de hacer dispatch.
    if (
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity < 1
    ) {
      throw new Error(
        "El precio o la cantidad del producto no son válidos."
      );
    }

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      throw new Error(
        "El stock del producto no es válido."
      );
    }

    if (requestedQuantity > stock) {
      throw new Error(
        "No hay suficiente inventario disponible."
      );
    }

    const existing = cartItems.find(
      (item) =>
        item.productId === product.id &&
        item.presentationId === presentation.id
    );

    const currentQuantity =
      existing?.quantity || 0;

    const newQuantity =
      currentQuantity + requestedQuantity;

    // Esta validación también ocurre ANTES del dispatch.
    if (newQuantity > stock) {
      throw new Error(
        "La cantidad supera el inventario disponible."
      );
    }

    dispatch({
      type: "ADD_TO_CART",
      payload: {
        product,
        presentation,
        quantity: requestedQuantity,
      },
    });
  }

  function updateQuantity(
    productId,
    presentationId,
    quantity
  ) {
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: {
        productId,
        presentationId,
        quantity,
      },
    });
  }

  function removeFromCart(
    productId,
    presentationId
  ) {
    dispatch({
      type: "REMOVE_FROM_CART",
      payload: {
        productId,
        presentationId,
      },
    });
  }

  function clearCart() {
    dispatch({
      type: "CLEAR_CART",
    });
  }

  const totalItems = cartItems.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  const totalPrice = cartItems.reduce(
    (total, item) =>
      total +
      item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart debe utilizarse dentro de CartProvider."
    );
  }

  return context;
}