-- Migration: add suspendedUntil to User
-- Adds a nullable timestamp with time zone column to the User table
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "suspendedUntil" TIMESTAMP WITH TIME ZONE;
