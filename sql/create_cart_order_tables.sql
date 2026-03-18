CREATE TABLE IF NOT EXISTS carts (
  cart_id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  status VARCHAR(50) DEFAULT 'active',
  PRIMARY KEY (cart_id),
  KEY IDX_carts_user_id (user_id),
  CONSTRAINT FK_carts_user_id FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cart_items (
  cart_item_id BIGINT NOT NULL AUTO_INCREMENT,
  cart_id BIGINT NOT NULL,
  book_id BIGINT NOT NULL,
  quantity INT DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (cart_item_id),
  UNIQUE KEY UK_cart_items_cart_book (cart_id, book_id),
  KEY IDX_cart_items_book_id (book_id),
  CONSTRAINT FK_cart_items_cart_id FOREIGN KEY (cart_id) REFERENCES carts (cart_id) ON DELETE CASCADE,
  CONSTRAINT FK_cart_items_book_id FOREIGN KEY (book_id) REFERENCES books (book_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  order_id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  order_discount_id BIGINT DEFAULT NULL,
  order_date DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  total_amount DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  PRIMARY KEY (order_id),
  KEY IDX_orders_user_id (user_id),
  CONSTRAINT FK_orders_user_id FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  order_item_id BIGINT NOT NULL AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  book_id BIGINT NOT NULL,
  quantity INT DEFAULT 1,
  price DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) DEFAULT 0,
  PRIMARY KEY (order_item_id),
  UNIQUE KEY UK_order_items_order_book (order_id, book_id),
  KEY IDX_order_items_book_id (book_id),
  CONSTRAINT FK_order_items_order_id FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE CASCADE,
  CONSTRAINT FK_order_items_book_id FOREIGN KEY (book_id) REFERENCES books (book_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
