-- Create function to check and maintain analysis limit
CREATE OR REPLACE FUNCTION check_analysis_limit()
RETURNS TRIGGER AS $$
BEGIN
    -- Count analyses for this session
    IF (SELECT COUNT(*) FROM "Analysis" WHERE "sessionId" = NEW."sessionId") > 10 THEN
        -- Delete oldest analysis when limit is exceeded
        DELETE FROM "Analysis"
        WHERE id IN (
            SELECT id FROM "Analysis"
            WHERE "sessionId" = NEW."sessionId"
            ORDER BY "createdAt" ASC
            LIMIT 1
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS enforce_analysis_limit ON "Analysis";

-- Create trigger
CREATE TRIGGER enforce_analysis_limit
    AFTER INSERT ON "Analysis"
    FOR EACH ROW
    EXECUTE FUNCTION check_analysis_limit();
