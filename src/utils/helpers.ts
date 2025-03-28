import type { FormData } from "@/@types/Data";
import { TRANSACTION_TYPE } from "@/@types/TransactionType";

export const generateQRCode = (data: FormData): string | null => {
  const {
    tillNumber,
    agentNumber,
    storeNumber,
    amount,
    accountNumber,
    paybillNumber,
    phoneNumber
  } = data;

  // switch (data.type) {
  //   case TRANSACTION_TYPE.TILL_NUMBER:
  //     return `BG|${tillNumber}`;
  //   case TRANSACTION_TYPE.PAYBILL:
  //     const paybill = `PB|${paybillNumber}|${accountNumber}`;
  //     return paybill;
  //   case TRANSACTION_TYPE.AGENT:
  //     return `WA|${agentNumber}|${storeNumber}`;
  //   case TRANSACTION_TYPE.SEND_MONEY:
  //     return `SM|${phoneNumber}`;
  //   default:
  //     return null;
  // }
  switch (data.type) {
    case TRANSACTION_TYPE.TILL_NUMBER:
      return `BG|${tillNumber}${data.hideAmount ? `` : `|${amount}`}`;
    case TRANSACTION_TYPE.PAYBILL:
      const paybill = `PB|${paybillNumber}|${accountNumber}|${amount}`;
      return paybill;
    case TRANSACTION_TYPE.AGENT:
      return `WA|${agentNumber}|${storeNumber}|${amount}`;
    case TRANSACTION_TYPE.SEND_MONEY:
      return `SM|${phoneNumber}|${amount}`;
    default:
      return null;
  }

  
};
