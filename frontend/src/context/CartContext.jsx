
import { createContext, useContext, useEffect, useState } from "react";

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

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  function addToCart(product, presentation, quantity = 1) {
    const productId = product.id;
    const presentationId = presentation.id;
    const price = Number(presentation.retailPrice);

    if (!Number.isFinite(price) || price < 0 || quantity < 1) {
      throw new Error("El precio o la cantidad del producto no son válidos.");
    }

    if (Number(presentation.stock) < quantity) {
      throw new Error("No hay suficiente inventario disponible.");
    }

    setCartItems((currentItems) => {
      const existing = currentItems.find(
        (item) =>
          item.productId === productId &&
          item.presentationId === presentationId
      );

      const newQuantity = (existing?.quantity || 0) + quantity;

      if (newQuantity > Number(presentation.stock)) {
        throw new Error("La cantidad supera el inventario disponible.");
      }

      if (existing) {
        return currentItems.map((item) =>
          item.productId === productId &&
          item.presentationId === presentationId
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      return [
        ...currentItems,
        {
          productId,
          presentationId,
          reference: product.reference,
          name: product.name,
          description: product.description,
          presentationName: presentation.name,
          size: presentation.size,
          price,
          stock: Number(presentation.stock),
          imageUrl: product.imageUrl || null,
          quantity,
        },
      ];
    });
  }

  function updateQuantity(productId, presentationId, quantity) {
    const newQuantity = Number(quantity);

    if (!Number.isInteger(newQuantity) || newQuantity < 1) {
      return;
    }

    setCartItems((items) =>
      items.map((item) => {
        if (
          item.productId !== productId ||
          item.presentationId !== presentationId
        ) {
          return item;
        }

        return {
          ...item,
          quantity: Math.min(newQuantity, item.stock),
        };
      })
    );
  }

  function removeFromCart(productId, presentationId) {
    setCartItems((items) =>
      items.filter(
        (item) =>
          item.productId !== productId ||
          item.presentationId !== presentationId
      )
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
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
    throw new Error("useCart debe utilizarse dentro de CartProvider.");
  }

  return context;
}
