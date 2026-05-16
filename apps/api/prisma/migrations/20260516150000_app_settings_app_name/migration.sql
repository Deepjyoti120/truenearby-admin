-- Add brandable app name to the singleton settings row.
ALTER TABLE "app_settings"
    ADD COLUMN "appName" TEXT NOT NULL DEFAULT 'Dating Admin';
