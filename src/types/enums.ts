export enum PaymentMethod {
  EFECTIVO = 'Efectivo Físico',
  DIGITAL = 'Dinero Digital',
  TRANSFERENCIA = 'Transferencia',
  TARJETA = 'Tarjeta',
  MERCADO_PAGO = 'Mercado Pago'
}

export enum MovementType {
  INGRESO = 'Ingreso',
  EGRESO = 'Egreso'
}

export type OrderStatus = 'pedido' | 'proceso' | 'terminado';

export type TabType = 'productos' | 'agenda' | 'caja' | 'dashboard' | 'resumen' | 'clientes' | 'proveedores' | 'presupuesto' | 'graficos' | 'calculadora' | 'deudores' | 'asistente';
