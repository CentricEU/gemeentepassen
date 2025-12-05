import React, { useState } from "react";
import BankHolidaysContext from "./bank-holidays-context";
import { BankHoliday } from "../../utils/types/bankHoliday";

const BankHolidaysProvider = ({ children }: any) => {

  const [bankHolidaysForCurrentYear, setBankHolidaysForCurrentYear] = useState([] as BankHoliday[]);

  return (
    <BankHolidaysContext.Provider value={{ bankHolidaysForCurrentYear, setBankHolidaysForCurrentYear }}>
      {children}
    </BankHolidaysContext.Provider>
  );
};

export default BankHolidaysProvider;
