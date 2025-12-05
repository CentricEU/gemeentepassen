import { createContext } from "react";

export type RefreshContextType = {
	refreshing: boolean;
	startRefresh: () => void;
	stopRefresh: () => void;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export default RefreshContext;
