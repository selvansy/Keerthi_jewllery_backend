export const getMakingChargeData = () => {
  return [
    { id: 1, name: "Zero Making Charge" },
    { id: 2, name: "Non Making Charge" },
  ];
};

export const getWastageTypeData = () => {
  return [
    { id: 1, name: "Zero Wastage" },
    { id: 2, name: "Non Zero Wastage" },
  ];
};

export const getGenderData = () => {
  return [
    { id: 1, name: "Male" },
    { id: 2, name: "Female" },
    { id: 3, name: "Others" },
  ];
};

export const getDisplayTypeData = () => {
  return [
    { id: 1, name: "Show" },
    { id: 2, name: "Hide" },
  ];
};

export const getShowTypeData = () => {
  return [
    { id: 1, name: "Show" },
    { id: 2, name: "Hide" },
  ];
};

export const getTypeWayData = () => {
  return [
    { id: "Offline", name: "Offline" },
    { id: "Online", name: "Online" },
  ];
};
export const getClassificationData = () => {
  return [
    { id: "1", name: "Non Digi Gold" },
    { id: "2", name: "Digi Gold" },
  ];
};

export const getAllPrintTypeData = () => {
  return [
    { id: "1", name: "Receipt Print (Top & Bottom)" },
    { id: "3", name: "Receipt Print(Left & Right)" },
    { id: "4", name: "Receipt Print (Center)" },
    { id: "2", name: "Card Print 1" },
    { id: "5", name: "Card Print 2" },
    { id: "10", name: "Card Print 3" },
    { id: "6", name: "Normal Receipt Without Logo" },
    { id: "7", name: "Normal Receipt With Logo" },
    { id: "8", name: "Tag Print 1" },
    { id: "9", name: "Tag Account Number & Receipt Print" },
  ];
};

export const getAllClosedPrintData = () => {
  return [
    { id: "1", name: "Close Print-1" },
    { id: "2", name: "Close Print-2" },
  ];
};
export const getReferralData = () => {
  return [
    { id: 1, name: "First Installment" },
    { id: 2, name: "Last Installment" },
  ];
};

export const getAllReciptTypeData = () => {
  return [
    { id: "1", name: "Generate Serial Wise Receipt Id" },
    { id: "2", name: "Generate Serial Wise Receipt No" },
    { id: "3", name: "Generate Scheme Wise Receipt No" },
    { id: "4", name: "Manual Receipt No" },
  ];
};

export const getSmsAccessTypeData = () => {
  return [
    { id: 1, name: "Both" },
    { id: 2, name: "APP MESSAGE" },
    { id: 3, name: "Admin MESSAGE" },
  ];
};
export const getWhatsappTypeData = () => {
  return [
    { id: 1, name: "Utility Transaction Message" },
    { id: 2, name: "Whatsapp Marketing Message" },
  ];
};
export const getPaymentTypeData = () => {
  return [
    { id: "1", name: "Cash Free" },
    { id: "2", name: "Easebuzz" },
  ];
};
export const getFundTypeData = () => {
  return [
    { id: 1, name: "Normal Scheme" },
    // { id: 2, name: "Fund Scheme" },
  ];
};

// export const getBuyGstTypeData = () => {
//   return [
//     { id: 1, name: "Buy Gst Starting" },
//     { id: 2, name: "Buy Gst End" },
//   ];
// };

export const getLayoutTypeData = () => {
  return [
    { id: 1, name: "Right Menu" },
    { id: 2, name: "Top Menu" },
  ];
};
export const addedTypeData = () => {
  return [
    { id: "0", name: "WEB ADMIN" },
    { id: "1", name: "ANDROID" },
    { id: "2", name: "IOS" },
  ];
};
export const giftIssueTypeData = () => {
  return [
    { id: 1, name: "Scheme Gift" },
    { id: 2, name: "Non Scheme Gift" },
  ];
};
export const offersTypeData = () => {
  return [
    { id: "0", name: "Offers" },
    { id: "1", name: "Banner" },
    { id: "2", name: "Popup" },
    { id: "3", name: "Marqueee" },
    { id: "4", name: "Video" },
  ];
};
export const displaySellTypeData = () => {
  return [
    { id: false, name: "Not Sell" },
    { id: true, name: "Sell" },
  ];
};
export const notificationTypeData = () => {
  return [
    { id: "1", name: "Offers" },
    { id: "2", name: "New Arrivals" },
    { id: "3", name: "Product" },
    { id: "4", name: "Wedding" },
    { id: "5", name: "Birthday" },
  ];
};

export const multiPaymentmodeData = () => {
  return [
    { id: "1", name: "Cash", name: "Cash", parameter: "cash_amount" },
    { id: "2", name: "Debit Card", parameter: "debitcard_amount" },
    { id: "3", name: "Credit Card", parameter: "card_amount" },
    { id: "4", name: "UPI", parameter: "upi_amount" },
    // { id: "4", name: "Phone Pay", parameter: "phonepay_amount" },
    // { id: "5", name: "Gpay", parameter: "gpay_amount" },
  ];
};

export const accountNoType = () => {
  return [
    { id: "1", name: "Generate Automatic Scheme A/c No" },
    { id: "2", name: "Generate Manual Scheme A/c No" },
    { id: "3", name: "Generate Automatic Searial Wise A/c No" },
    { id: "4", name: "Generate Automatic Classification Wise A/c No" },
  ];
};

export const getRedeemType = () => {
  return [
    { id: "1", name: "Direct" },
    { id: "2", name: "Purchase" },
    // { id: "3", name: "Refferal" },
    // { id: "4", name: "Incentives" },
  ];
};

export const getContentType = () => {
  return [
    { id: "1", name: "Terms & Conditions" },
    { id: "2", name: "Privacy Policy" },
    // { id: "3", name: "Return Policy" },
    { id: "3", name: "Refund Policy" },
    { id: "4", name: "About Us" },
  ];
};

export const getFaqCategories = () => {
  return [
    { id: "1", name: "General" },
    { id: "2", name: "Payments" },
    { id: "3", name: "Jewellery Chit Scheme" },
    { id: "4", name: "Gold Savings Plan" },
  ];
};

