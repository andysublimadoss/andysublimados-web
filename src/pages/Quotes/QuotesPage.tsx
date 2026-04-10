import React from 'react';
import { QuotesManager } from '@/features';
import { Quote, Customer } from '@/types';

interface QuotesPageProps {
  quotes: Quote[];
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
  customers: Customer[];
  showToast: (msg: string, type: 'success' | 'error') => void;
}

const QuotesPage: React.FC<QuotesPageProps> = (props) => {
  return <QuotesManager {...props} />;
};

export default QuotesPage;
