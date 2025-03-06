-- Add unique constraint on content column
ALTER TABLE trading_knowledge_embeddings ADD CONSTRAINT trading_knowledge_embeddings_content_key UNIQUE (content);
