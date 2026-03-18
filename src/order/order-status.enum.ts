export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPING = 'shipping',
  SHIPPED = 'shipped',
  DELIVERING = 'delivering',
  COMPLETED = 'completed',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export const SHIPPING_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.SHIPPING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERING,
  OrderStatus.COMPLETED,
];