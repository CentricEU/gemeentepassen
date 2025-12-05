import { ReactNode, useContext, useState } from "react";
import RefreshContext from "./refresh-context";
import { RefreshContextType } from "./refresh-context";

export const RefreshProvider = ({ children }: { children: ReactNode }) => {
	const [refreshing, setRefreshing] = useState(false);

	const startRefresh = () => setRefreshing(true);

	const stopRefresh = () => setRefreshing(false);

	return (
		<RefreshContext.Provider
			value={{ refreshing, startRefresh, stopRefresh }}
		>
			{children}
		</RefreshContext.Provider>
	);
};

export const useRefresh = (): RefreshContextType => {
	const context = useContext(RefreshContext);
	if (!context) {
		throw new Error("useRefresh hook must be used within a RefreshProvider");
	}
	return context;
};