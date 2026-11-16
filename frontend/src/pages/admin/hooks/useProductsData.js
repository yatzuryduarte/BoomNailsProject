import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../../../services/api";

export function useProductsData() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/admin/productos");

      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "No fue posible cargar los productos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    loadProducts,
  };
}