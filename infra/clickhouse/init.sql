-- Таблица для сбора и агрегации финтех-логов распределенной Саги
CREATE TABLE IF NOT EXISTS saga_analytics_logs (
    id UUID DEFAULT generateUUIDv4(),
    event_type LowCardinality(String),
    amount Decimal(15, 2),
    original_reference_id String,
    timestamp DateTime
)
ENGINE = MergeTree()
ORDER BY (event_type, timestamp);
