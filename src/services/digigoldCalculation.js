function calculateDigiGoldBonus({
    scheme,
    paymentDate,
    paymentAmount,
    installmentNumber,
    schemeJoinDate
  }) {
    const { bonus_type, entry_type, values, bonuses } = scheme;
  
    const applyBonus = (amount, bonusPercent) =>
      amount + (amount * bonusPercent) / 100;
  
    let finalAmount = paymentAmount;
    let appliedBonusPercent = 0;
  
    if (bonus_type === 1) {
      if (entry_type === 1) {
        values.forEach((item, index) => {
          if (item.value === installmentNumber) {
            appliedBonusPercent = bonuses[index] || 0;
            finalAmount = applyBonus(paymentAmount, appliedBonusPercent);
          }
        });
      } else if (entry_type === 2) {
        values.forEach((item, index) => {
          if (
            installmentNumber >= item.min &&
            installmentNumber <= item.max
          ) {
            appliedBonusPercent = bonuses[index] || 0;
            finalAmount = applyBonus(paymentAmount, appliedBonusPercent);
          }
        });
      }
    } else if (bonus_type === 2) {
      const joinedDate = new Date(schemeJoinDate);
      const daysSinceJoin = Math.floor(
        (new Date(paymentDate) - joinedDate) / (1000 * 60 * 60 * 24)
      );
  
      if (entry_type === 1) {
        values.forEach((item, index) => {
          if (item.value === daysSinceJoin) {
            appliedBonusPercent = bonuses[index] || 0;
            finalAmount = applyBonus(paymentAmount, appliedBonusPercent);
          }
        });
      } else if (entry_type === 2) {
        values.forEach((item, index) => {
          if (
            daysSinceJoin >= item.min &&
            daysSinceJoin <= item.max
          ) {
            appliedBonusPercent = bonuses[index] || 0;
            finalAmount = applyBonus(paymentAmount, appliedBonusPercent);
          }
        });
      }
    } else if (bonus_type === 3) {
      if (entry_type === 1) {
        values.forEach((item, index) => {
          if (item.value === paymentAmount) {
            appliedBonusPercent = bonuses[index] || 0;
            finalAmount = applyBonus(paymentAmount, appliedBonusPercent);
          }
        });
      } else if (entry_type === 2) {
        values.forEach((item, index) => {
          if (
            paymentAmount >= item.min &&
            paymentAmount <= item.max
          ) {
            appliedBonusPercent = bonuses[index] || 0;
            finalAmount = applyBonus(paymentAmount, appliedBonusPercent);
          }
        });
      }
    }
  
    return {
      finalAmount,
      appliedBonusPercent
    };
  }
  
  export default calculateDigiGoldBonus;
  