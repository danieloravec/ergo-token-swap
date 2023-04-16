export interface Message {
  id: number;
  fromAddress: string;
  toAddress: string;
  subject: string;
  text: string;
  seen: boolean;
  archived: boolean;
  createdAt: string;
}

export interface MessageStructure {
  sent: Message[];
  received: Message[];
}
