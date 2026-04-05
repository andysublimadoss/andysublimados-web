import React, { useState } from 'react';
import { Inventory } from '@/features';
import { Product } from '@/types';

interface InventoryPageProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  showToast: (msg: string, type: 'success' | 'error') => void;
  initialSearch?: string;
}

const InventoryPage: React.FC<InventoryPageProps> = ({ products, setProducts, showToast, initialSearch = '' }) => {
  const [inventorySearch, setInventorySearch] = useState(initialSearch);

  return (
    <Inventory
      products={products}
      setProducts={setProducts}
      initialSearch={inventorySearch}
      onSearchChange={setInventorySearch}
      showToast={showToast}
    />
  );
};

export default InventoryPage;
