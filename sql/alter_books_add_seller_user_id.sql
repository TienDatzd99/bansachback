ALTER TABLE books
  ADD COLUMN seller_user_id BIGINT NULL AFTER author_id,
  ADD KEY IDX_books_seller_user_id (seller_user_id),
  ADD CONSTRAINT FK_books_seller_user_id FOREIGN KEY (seller_user_id) REFERENCES users (user_id) ON DELETE SET NULL;
