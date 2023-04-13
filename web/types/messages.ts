export interface Message {
  fromAddress: string;
  toAddress: string;
  subject: string;
  text: string;
  seen: boolean;
  archived: boolean;
  createdAt: string;
}
