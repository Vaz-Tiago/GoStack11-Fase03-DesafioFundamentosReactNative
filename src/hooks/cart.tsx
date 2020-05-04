import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const response = await AsyncStorage.getItem('@products');
      if (response) {
        setProducts(JSON.parse(response));
      }
    }
    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      // TODO ADD A NEW ITEM TO THE CART
      const productIndex = products.findIndex(item => item.id === product.id);
      if (productIndex !== -1) {
        const newProduct = products[productIndex];
        newProduct.quantity += 1;
        const newList = products.filter(
          item => item.id !== products[productIndex].id,
        );
        newList.push(newProduct);
        setProducts(newList);
        await AsyncStorage.setItem('@products', JSON.stringify(products));
      } else {
        product.quantity = 1;
        setProducts([...products, product]);
        await AsyncStorage.setItem('@products', JSON.stringify(products));
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const updatedList = products.map(item => {
        if (item.id === id) {
          item.quantity += 1;
        }
        return item;
      });

      setProducts(updatedList);
      await AsyncStorage.setItem('@products', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const updatedList = products.map(item => {
        if (item.id === id) {
          item.quantity -= 1;
        }
        return item;
      });

      setProducts(updatedList.filter(item => item.quantity > 0));
      await AsyncStorage.setItem('@products', JSON.stringify(products));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
