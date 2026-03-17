/*
  # Add Notifications and Document Verification System

  ## Overview
  This migration adds comprehensive notification tracking and document verification 
  to support user mortgage application tracking and status updates.

  ## 1. New Tables

  ### `user_notifications`
  Tracks all notifications sent to users about application status changes
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK to profiles)
  - `application_id` (uuid, FK to mortgage_applications)
  - `notification_type` (text) - status_change, document_request, general
  - `title` (text) - notification headline
  - `message` (text) - notification content
  - `status` (text) - unread, read
  - `read_at` (timestamptz) - when user read notification
  - `created_at` (timestamptz)

  ### `document_verification`
  Tracks document upload verification status
  - `id` (uuid, primary key)
  - `application_id` (uuid, FK to mortgage_applications)
  - `document_type` (text)
  - `upload_status` (text) - pending, uploading, verified, failed
  - `verification_details` (jsonb) - metadata about verification
  - `verified_at` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## 2. Enhanced application_documents table
  
  Adds upload_status and verification fields

  ## 3. Enhanced mortgage_applications table
  
  Adds last_viewed_by_user_at for tracking user engagement

  ## 4. Security
  
  - Enable RLS on new tables
  - Users can view/update their own notifications
  - Users can view their own document verification records
  - Mortgage institutions can view all verification records

  ## 5. Performance
  
  - Indexes on user_id for fast notification queries
  - Indexes on application_id for document verification lookup
  - Indexes on status for filtering unread notifications
*/

-- Create notification_type enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM ('status_change', 'document_request', 'general', 'approval', 'rejection', 'under_review');
  END IF;
END $$;

-- Create notification_status enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_status') THEN
    CREATE TYPE notification_status AS ENUM ('unread', 'read');
  END IF;
END $$;

-- Create upload_status enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'upload_status') THEN
    CREATE TYPE upload_status AS ENUM ('pending', 'uploading', 'verified', 'failed');
  END IF;
END $$;

-- Create user_notifications table
CREATE TABLE IF NOT EXISTS user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  application_id uuid REFERENCES mortgage_applications(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL DEFAULT 'general',
  title text NOT NULL,
  message text NOT NULL,
  status notification_status NOT NULL DEFAULT 'unread',
  metadata jsonb DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create document_verification table
CREATE TABLE IF NOT EXISTS document_verification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES mortgage_applications(id) ON DELETE CASCADE NOT NULL,
  document_type text NOT NULL,
  upload_status upload_status NOT NULL DEFAULT 'pending',
  file_url text,
  file_name text,
  file_size int,
  verification_details jsonb DEFAULT '{}'::jsonb,
  error_message text,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add columns to mortgage_applications
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'last_viewed_by_user_at') THEN
    ALTER TABLE mortgage_applications ADD COLUMN last_viewed_by_user_at timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mortgage_applications' AND column_name = 'documents_verified') THEN
    ALTER TABLE mortgage_applications ADD COLUMN documents_verified boolean DEFAULT false;
  END IF;
END $$;

-- Add columns to application_documents
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'application_documents' AND column_name = 'upload_status') THEN
    ALTER TABLE application_documents ADD COLUMN upload_status upload_status DEFAULT 'verified';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'application_documents' AND column_name = 'verified_at') THEN
    ALTER TABLE application_documents ADD COLUMN verified_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_application_id ON user_notifications(application_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_status ON user_notifications(status);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_verification_application_id ON document_verification(application_id);
CREATE INDEX IF NOT EXISTS idx_document_verification_upload_status ON document_verification(upload_status);
CREATE INDEX IF NOT EXISTS idx_mortgage_applications_user_viewed ON mortgage_applications(user_id, last_viewed_by_user_at);

-- Enable RLS
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_verification ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_notifications
CREATE POLICY "Users can view own notifications"
  ON user_notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON user_notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Mortgage institutions can insert notifications"
  ON user_notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'mortgage_institution'
    )
  );

CREATE POLICY "System can insert notifications"
  ON user_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for document_verification
CREATE POLICY "Users can view own document verification"
  ON document_verification FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mortgage_applications ma
      WHERE ma.id = document_verification.application_id
      AND ma.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own document verification"
  ON document_verification FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mortgage_applications ma
      WHERE ma.id = document_verification.application_id
      AND ma.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own document verification"
  ON document_verification FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM mortgage_applications ma
      WHERE ma.id = document_verification.application_id
      AND ma.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mortgage_applications ma
      WHERE ma.id = document_verification.application_id
      AND ma.user_id = auth.uid()
    )
  );

CREATE POLICY "Mortgage institutions can view all document verification"
  ON document_verification FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'mortgage_institution'
    )
  );

CREATE POLICY "Mortgage institutions can update all document verification"
  ON document_verification FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'mortgage_institution'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'mortgage_institution'
    )
  );

-- Function to create notification when application status changes
CREATE OR REPLACE FUNCTION notify_application_status_change()
RETURNS TRIGGER AS $$
DECLARE
  notification_title text;
  notification_message text;
  notification_type_val notification_type;
BEGIN
  -- Only create notification if status changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Set notification content based on new status
    CASE NEW.status
      WHEN 'submitted' THEN
        notification_title := 'Application Submitted';
        notification_message := 'Your mortgage application has been successfully submitted and is awaiting review.';
        notification_type_val := 'status_change';
      WHEN 'under_review' THEN
        notification_title := 'Application Under Review';
        notification_message := 'Your mortgage application is currently being reviewed by our team.';
        notification_type_val := 'under_review';
      WHEN 'conditional' THEN
        notification_title := 'Conditional Approval';
        notification_message := 'Your mortgage application has received conditional approval. Additional documentation may be required.';
        notification_type_val := 'status_change';
      WHEN 'approved' THEN
        notification_title := 'Application Approved!';
        notification_message := 'Congratulations! Your mortgage application has been approved. A representative will contact you with next steps.';
        notification_type_val := 'approval';
      WHEN 'rejected' THEN
        notification_title := 'Application Status Update';
        notification_message := 'Your mortgage application has been reviewed. Please check your application details for more information.';
        notification_type_val := 'rejection';
      ELSE
        notification_title := 'Application Status Updated';
        notification_message := 'Your mortgage application status has been updated. Please check your application for details.';
        notification_type_val := 'status_change';
    END CASE;

    -- Insert notification
    INSERT INTO user_notifications (user_id, application_id, notification_type, title, message, metadata)
    VALUES (
      NEW.user_id,
      NEW.id,
      notification_type_val,
      notification_title,
      notification_message,
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status, 'updated_at', NEW.updated_at)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for application status changes
DROP TRIGGER IF EXISTS trigger_notify_application_status_change ON mortgage_applications;
CREATE TRIGGER trigger_notify_application_status_change
  AFTER UPDATE ON mortgage_applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_application_status_change();
