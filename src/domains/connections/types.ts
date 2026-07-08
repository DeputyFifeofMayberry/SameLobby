export type ConnectionRequestStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "expired"
  | "cancelled";

export type ConnectionStatus = "connected" | "archived" | "ended";

export type ConnectionRequest = {
  id: string;
  sender_account_id: string;
  recipient_account_id: string;
  intent_id: string | null;
  message: string | null;
  status: ConnectionRequestStatus;
  expires_at: string;
  created_at: string;
  updated_at: string;
  responded_at: string | null;
};

export type Connection = {
  id: string;
  user_a_id: string;
  user_b_id: string;
  connection_request_id: string | null;
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
};

export type ConnectionRequestView = ConnectionRequest & {
  otherAccountId: string;
  otherDisplayName: string;
  direction: "incoming" | "outgoing";
};

export type ConnectionView = Connection & {
  otherAccountId: string;
  otherDisplayName: string;
};

export type RequestRelationshipState =
  | "none"
  | "pending_outgoing"
  | "pending_incoming"
  | "connected"
  | "blocked";
