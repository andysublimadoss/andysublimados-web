import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PricingCalculator } from '@/features';
import { Product } from '@/types';

interface CalculatorPageProps {
  products: Product[];
}

const CalculatorPage: React.FC<CalculatorPageProps> = (props) => {
  const navigate = useNavigate();

  return <PricingCalculator {...props} navigate={navigate} />;
};

export default CalculatorPage;
