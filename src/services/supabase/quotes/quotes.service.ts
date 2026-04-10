import { supabase } from '@/lib/supabase';
import type { Quote, QuoteItem } from '@/types';

export interface DBQuote {
  quote_id: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  quote_date: string;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBQuoteItem {
  quote_item_id: string;
  quote_id: string;
  quantity: number;
  description: string;
  unit_price: number;
  total: number;
  created_at: string;
}

function toAppQuote(dbQuote: DBQuote, quoteItems: DBQuoteItem[] = []): Quote {
  return {
    id: dbQuote.quote_id,
    customerName: dbQuote.customer_name,
    customerPhone: dbQuote.customer_phone || '',
    date: dbQuote.quote_date,
    totalAmount: dbQuote.total_amount,
    notes: dbQuote.notes || '',
    items: quoteItems.map(item => ({
      id: item.quote_item_id,
      quantity: item.quantity,
      description: item.description,
      unitPrice: item.unit_price,
      total: item.total
    }))
  };
}

function toDBQuote(quote: Partial<Quote>): Partial<DBQuote> {
  const dbQuote: Partial<DBQuote> = {
    customer_name: quote.customerName,
    customer_phone: quote.customerPhone,
    quote_date: quote.date,
    total_amount: quote.totalAmount,
    notes: quote.notes
  };

  if (quote.id) {
    dbQuote.quote_id = quote.id;
  }

  return dbQuote;
}

export const quotesService = {
  async getAll(): Promise<Quote[]> {
    const { data: quotes, error: quotesError } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (quotesError) throw quotesError;

    const quotesWithItems = await Promise.all(
      (quotes || []).map(async (quote) => {
        const { data: items } = await supabase
          .from('quote_items')
          .select('*')
          .eq('quote_id', quote.quote_id);

        return toAppQuote(quote, items || []);
      })
    );

    return quotesWithItems;
  },

  async getById(id: string): Promise<Quote | null> {
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('quote_id', id)
      .single();

    if (quoteError) throw quoteError;
    if (!quote) return null;

    const { data: items } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', id);

    return toAppQuote(quote, items || []);
  },

  async create(quote: Omit<Quote, 'id'>): Promise<Quote> {
    const dbQuote = toDBQuote(quote);
    delete dbQuote.quote_id;

    const { data: newQuote, error: quoteError } = await supabase
      .from('quotes')
      .insert(dbQuote)
      .select()
      .single();

    if (quoteError) throw quoteError;

    if (quote.items && quote.items.length > 0) {
      const quoteItems = quote.items.map(item => ({
        quote_id: newQuote.quote_id,
        quantity: item.quantity,
        description: item.description,
        unit_price: item.unitPrice,
        total: item.total
      }));

      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(quoteItems);

      if (itemsError) throw itemsError;
    }

    return this.getById(newQuote.quote_id) as Promise<Quote>;
  },

  async update(id: string, quote: Partial<Quote>): Promise<Quote> {
    const dbQuote = toDBQuote(quote);
    delete dbQuote.quote_id;

    const { error: quoteError } = await supabase
      .from('quotes')
      .update({ ...dbQuote, updated_at: new Date().toISOString() })
      .eq('quote_id', id);

    if (quoteError) throw quoteError;

    if (quote.items) {
      await supabase
        .from('quote_items')
        .delete()
        .eq('quote_id', id);

      if (quote.items.length > 0) {
        const quoteItems = quote.items.map(item => ({
          quote_id: id,
          quantity: item.quantity,
          description: item.description,
          unit_price: item.unitPrice,
          total: item.total
        }));

        const { error: itemsError } = await supabase
          .from('quote_items')
          .insert(quoteItems);

        if (itemsError) throw itemsError;
      }
    }

    return this.getById(id) as Promise<Quote>;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('quote_id', id);

    if (error) throw error;
  }
};
