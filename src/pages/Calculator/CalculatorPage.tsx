import React from 'react';
import { PricingCalculator } from '@/features';
import { Product } from '@/types';

interface CalculatorPageProps {
  products: Product[];
}

const CalculatorPage: React.FC<CalculatorPageProps> = (props) => {
  return <PricingCalculator {...props} />;
};

export default CalculatorPage;
