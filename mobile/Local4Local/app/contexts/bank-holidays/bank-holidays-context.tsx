import { createContext } from "react";
import { BankHoliday } from "../../utils/types/bankHoliday";


type BankHolidaysContextType = {
  bankHolidaysForCurrentYear: BankHoliday[];
  setBankHolidaysForCurrentYear: (holidays: BankHoliday[]) => void;
};

const BankHolidaysContext = createContext<BankHolidaysContextType>({
  bankHolidaysForCurrentYear: [],
  setBankHolidaysForCurrentYear: (holidays: BankHoliday[]) => { },
});

export default BankHolidaysContext;
