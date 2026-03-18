CREATE TABLE IF NOT EXISTS payments (
  payment_id BIGINT NOT NULL AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  amount DECIMAL(10,2) DEFAULT NULL,
  payment_date DATETIME(6) DEFAULT NULL,
  qr_code TEXT DEFAULT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  PRIMARY KEY (payment_id),
  KEY IDX_payments_order_id (order_id),
  KEY IDX_payments_user_id (user_id),
  CONSTRAINT FK_payments_order_id FOREIGN KEY (order_id) REFERENCES orders (order_id),
  CONSTRAINT FK_payments_user_id FOREIGN KEY (user_id) REFERENCES users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
