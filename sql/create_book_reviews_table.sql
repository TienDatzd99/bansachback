CREATE TABLE IF NOT EXISTS book_reviews (
  review_id BIGINT NOT NULL AUTO_INCREMENT,
  book_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  rating TINYINT NOT NULL,
  review_text TEXT DEFAULT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (review_id),
  UNIQUE KEY UK_book_reviews_book_user (book_id, user_id),
  KEY IDX_book_reviews_book_id (book_id),
  KEY IDX_book_reviews_user_id (user_id),
  CONSTRAINT FK_book_reviews_book_id FOREIGN KEY (book_id) REFERENCES books (book_id) ON DELETE CASCADE,
  CONSTRAINT FK_book_reviews_user_id FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
  CONSTRAINT CHK_book_reviews_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
