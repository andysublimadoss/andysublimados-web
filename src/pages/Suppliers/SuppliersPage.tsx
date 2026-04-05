import React from 'react';
import { SuppliersList } from '@/features';
import { Supplier } from '@/types';

interface SuppliersPageProps {
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

const SuppliersPage: React.FC<SuppliersPageProps> = (props) => {
  return <SuppliersList {...props} />;
};

export default SuppliersPage;
