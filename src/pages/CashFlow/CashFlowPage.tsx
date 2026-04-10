import React from 'react';
import { CashFlow } from '@/features';
import { CashMovement } from '@/types';

interface CashFlowPageProps {
  movements: CashMovement[];
  setMovements: React.Dispatch<React.SetStateAction<CashMovement[]>>;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

const CashFlowPage: React.FC<CashFlowPageProps> = (props) => {
  return <CashFlow {...props} />;
};

export default CashFlowPage;
