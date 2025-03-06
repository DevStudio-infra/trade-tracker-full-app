-- Create the rag_feedback table
CREATE TABLE rag_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    query_text TEXT NOT NULL,
    selected_knowledge TEXT[] NOT NULL,
    is_relevant BOOLEAN NOT NULL,
    feedback_text TEXT,
    suggested_improvement TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Create the knowledge usage metrics table
CREATE TABLE knowledge_usage_metrics (
    knowledge_id UUID PRIMARY KEY,
    usage_count INTEGER NOT NULL DEFAULT 0,
    relevance_score FLOAT NOT NULL DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_knowledge
        FOREIGN KEY(knowledge_id)
        REFERENCES trading_knowledge_embeddings(id)
        ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_rag_feedback_user ON rag_feedback(user_id);
CREATE INDEX idx_rag_feedback_relevance ON rag_feedback(is_relevant);
CREATE INDEX idx_knowledge_metrics_score ON knowledge_usage_metrics(relevance_score);
CREATE INDEX idx_knowledge_metrics_usage ON knowledge_usage_metrics(usage_count);

-- Add the tables to the pgvector extension schema
ALTER TABLE rag_feedback SET SCHEMA public;
ALTER TABLE knowledge_usage_metrics SET SCHEMA public;
