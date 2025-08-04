DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'adminDB'
  ) THEN
    CREATE ROLE adminDB LOGIN PASSWORD 'BOT778211';
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_database WHERE datname = 'plantIdDB'
  ) THEN
    CREATE DATABASE plantIdDB OWNER adminDB;
  END IF;
END;
$$;