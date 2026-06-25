export const serializeTransaction = (obj) => {
    const serialized = { ...obj };
  
    if (obj.balance != null) {
      serialized.balance = obj.balance.toNumber();
    }
    if (obj.amount != null) {
      serialized.amount = obj.amount.toNumber();
    }
  
    return serialized;
  };