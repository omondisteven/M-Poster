//...src/utils/helpers.ts
import type { FormData } from "@/@types/Data";
import { TRANSACTION_TYPE } from "@/@types/TransactionType";

export const generateQRCode = (data: FormData): string | null => {
  const {
    tillNumber,
    agentNumber,
    storeNumber,
    accountNumber,
    paybillNumber,
    phoneNumber,
    type
  } = data;

  switch (type) {
    case TRANSACTION_TYPE.TILL_NUMBER:
      if (!tillNumber) return null;
      return `BG|${tillNumber}`; // Buy Goods format
    
      case TRANSACTION_TYPE.PAYBILL:
        if (!paybillNumber || !accountNumber) return null;
        // Use empty string for amount to prompt user input
        return `PB|${paybillNumber}||${accountNumber}`; 
        // Notice the double pipe || which means empty amount
    
    case TRANSACTION_TYPE.AGENT:
      if (!agentNumber || !storeNumber) return null;
      return `WA|${agentNumber}|${storeNumber}`; // Withdraw format
    
    case TRANSACTION_TYPE.SEND_MONEY:
      if (!phoneNumber) return null;
      return `SM|${phoneNumber}`; // Send Money format
    
    default:
      return null;
  }
};
