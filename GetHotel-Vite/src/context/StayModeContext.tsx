import React, { createContext, useContext, useState, useEffect } from "react";

type StayMode = "nightly" | "hourly";

interface StayModeContextType {
    mode: StayMode;
    setMode: (mode: StayMode) => void;
    toggleMode: () => void;
}

const StayModeContext = createContext<StayModeContextType | undefined>(undefined);

export const StayModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setModeState] = useState<StayMode>(() => {
        const saved = localStorage.getItem("stay_mode");
        return (saved as StayMode) || "nightly";
    });

    const setMode = (newMode: StayMode) => {
        setModeState(newMode);
        localStorage.setItem("stay_mode", newMode);
    };

    const toggleMode = () => {
        const newMode = mode === "nightly" ? "hourly" : "nightly";
        setMode(newMode);
    };

    return (
        <StayModeContext.Provider value={{ mode, setMode, toggleMode }}>
            {children}
        </StayModeContext.Provider>
    );
};

export const useStayMode = () => {
    const context = useContext(StayModeContext);
    if (!context) {
        throw new Error("useStayMode must be used within a StayModeProvider");
    }
    return context;
};
