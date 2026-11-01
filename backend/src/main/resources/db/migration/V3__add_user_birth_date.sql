ALTER TABLE users
    ADD COLUMN birth_date DATE;

ALTER TABLE users
    DROP COLUMN is_adult;
