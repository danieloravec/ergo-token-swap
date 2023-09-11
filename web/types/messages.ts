export interface Message {
  id: number;
  from_address: string;
  to_address: string;
  subject: string;
  text: string;
  seen: boolean;
  archived: boolean;
  created_at: string;
}

export interface MessageStructure {
  sent: Message[];
  received: Message[];
}
