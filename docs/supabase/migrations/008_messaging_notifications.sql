-- ZemNet Database Schema - Messaging & Notifications Migration
-- Created: 2025-12-24
-- Description: Add messaging and notification support for service requests

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Notification types
CREATE TYPE notification_type AS ENUM (
  'request_created',
  'request_updated',
  'request_assigned',
  'request_accepted',
  'request_rejected',
  'request_started',
  'request_completed',
  'request_cancelled',
  'new_message',
  'system'
);

-- Message sender types
CREATE TYPE message_sender_type AS ENUM ('host', 'technician', 'system');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Request messages table
CREATE TABLE request_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_type message_sender_type NOT NULL,
  content TEXT NOT NULL,
  attachments TEXT[], -- Array of attachment URLs
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT non_empty_content CHECK (LENGTH(TRIM(content)) > 0)
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT, -- Deep link to related content
  reference_id UUID, -- Reference to request, message, etc.
  reference_type VARCHAR(50), -- 'service_request', 'message', etc.
  metadata JSONB, -- Additional context data
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT non_empty_title CHECK (LENGTH(TRIM(title)) > 0),
  CONSTRAINT non_empty_message CHECK (LENGTH(TRIM(message)) > 0)
);

-- ============================================================================
-- ALTER EXISTING TABLES
-- ============================================================================

-- Add new fields to service_requests table
ALTER TABLE service_requests
  ADD COLUMN last_updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN update_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN has_unread_messages BOOLEAN NOT NULL DEFAULT FALSE;

-- Add comment for new fields
COMMENT ON COLUMN service_requests.last_updated_by IS 'User who last updated the request';
COMMENT ON COLUMN service_requests.update_count IS 'Number of times the request has been updated';
COMMENT ON COLUMN service_requests.has_unread_messages IS 'Whether there are unread messages for this request';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Request messages indexes
CREATE INDEX idx_request_messages_request_id ON request_messages(request_id);
CREATE INDEX idx_request_messages_sender_id ON request_messages(sender_id);
CREATE INDEX idx_request_messages_created_at ON request_messages(created_at DESC);
CREATE INDEX idx_request_messages_is_read ON request_messages(is_read);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_reference ON notifications(reference_id, reference_type);

-- Service requests new fields indexes
CREATE INDEX idx_service_requests_last_updated_by ON service_requests(last_updated_by);
CREATE INDEX idx_service_requests_has_unread ON service_requests(has_unread_messages);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update has_unread_messages flag when new message is added
CREATE OR REPLACE FUNCTION update_request_unread_messages()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark request as having unread messages
  UPDATE service_requests
  SET has_unread_messages = TRUE,
      updated_at = NOW()
  WHERE id = NEW.request_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update unread messages flag
CREATE TRIGGER trigger_update_request_unread_messages
  AFTER INSERT ON request_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_request_unread_messages();

-- Function to mark messages as read and update request flag
CREATE OR REPLACE FUNCTION mark_request_messages_read(
  p_request_id UUID,
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  -- Mark all unread messages as read for this user
  UPDATE request_messages
  SET is_read = TRUE,
      read_at = NOW(),
      updated_at = NOW()
  WHERE request_id = p_request_id
    AND is_read = FALSE
    AND sender_id != p_user_id;
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  -- If all messages are now read, update the request flag
  IF NOT EXISTS (
    SELECT 1 FROM request_messages
    WHERE request_id = p_request_id
      AND is_read = FALSE
      AND sender_id != p_user_id
  ) THEN
    UPDATE service_requests
    SET has_unread_messages = FALSE,
        updated_at = NOW()
    WHERE id = p_request_id;
  END IF;
  
  RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title VARCHAR(255),
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type VARCHAR(50) DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    action_url,
    reference_id,
    reference_type,
    metadata
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_action_url,
    p_reference_id,
    p_reference_type,
    p_metadata
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create notification for new message
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  v_request service_requests%ROWTYPE;
  v_recipient_id UUID;
  v_sender_name VARCHAR(255);
BEGIN
  -- Get request details
  SELECT * INTO v_request
  FROM service_requests
  WHERE id = NEW.request_id;
  
  -- Get sender name
  SELECT name INTO v_sender_name
  FROM users
  WHERE id = NEW.sender_id;
  
  -- Determine recipient (opposite of sender)
  IF NEW.sender_type = 'host' THEN
    v_recipient_id := v_request.technician_id;
  ELSE
    v_recipient_id := v_request.host_id;
  END IF;
  
  -- Create notification for recipient if they exist
  IF v_recipient_id IS NOT NULL THEN
    PERFORM create_notification(
      v_recipient_id,
      'new_message'::notification_type,
      'Nouveau message',
      v_sender_name || ' a envoyé un message concernant: ' || v_request.title,
      '/(app)/(host)/technician-requests/' || v_request.id::TEXT,
      NEW.id,
      'message',
      jsonb_build_object('request_id', v_request.id, 'sender_id', NEW.sender_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create notification on new message
CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON request_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE request_messages IS 'Messages exchanged between hosts and technicians for service requests';
COMMENT ON TABLE notifications IS 'In-app notifications for users';

COMMENT ON COLUMN request_messages.sender_type IS 'Type of sender: host, technician, or system';
COMMENT ON COLUMN request_messages.attachments IS 'Array of URLs to attached files/images';
COMMENT ON COLUMN notifications.action_url IS 'Deep link URL to navigate to related content';
COMMENT ON COLUMN notifications.metadata IS 'Additional context data in JSON format';
