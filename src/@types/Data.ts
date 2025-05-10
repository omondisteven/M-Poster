//...src/@types/Data.ts
import { TRANSACTION_TYPE } from "./TransactionType";

export interface Data {
  name: string;
  logo: string;
  paybillNumber: string;
  accountNumber: string;
  tillNumber: string;
  storeNumber: string;
  agentNumber: string;
  amount: string;
  type: TRANSACTION_TYPE;
  code: string;
  bannerText: string;
  color: string;
  phoneNumber:string;
  hideAmount:boolean;

  // Business profile fields
  businessName: string;
  businessTitle: string;
  businessEmail: string;
  businessPhone: string;
  businessWebsite: string;
  businessComment: string;
  businessAddress: string;
  businessWhatsapp: string;
  businessPromo1: string;
  businessPromo2: string;
}

export type FormData = Partial<Data>;
