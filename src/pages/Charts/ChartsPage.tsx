import React from 'react';
import { ChartsView } from '@/features';
import { CashMovement, Order, Product } from '@/types';

interface ChartsPageProps {
  movements: CashMovement[];
  orders: Order[];
  products: Product[];
}

const ChartsPage: React.FC<ChartsPageProps> = (props) => {
  return <ChartsView {...props} />;
};

export default ChartsPage;
