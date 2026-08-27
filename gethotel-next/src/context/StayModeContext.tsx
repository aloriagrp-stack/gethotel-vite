'use client';

import React, { createContext, useContext, useState, useEffect } from "react";

type StayMode = "nightly" | "hourly";

interface StayModeContextType {
    mode: StayMode;
    setMode: (mode: StayMode) => void;
    toggleMode: () => void;
}

const StayModeContext = createContext<StayModeContextType | undefined>(undefined);

export const StayModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setModeState] = useState<StayMode>("nightly");

    useEffect(() => {
        try {
            const saved = localStorage.getItem("stay_mode");
            if (saved === "hourly" || saved === "nightly") {
                setModeState(saved as StayMode);
            }
        } catch (e) {
            console.error("Failed to load stay_mode from localStorage:", e);
        }
    }, []);

    const setMode = (newMode: StayMode) => {
        setModeState(newMode);
        try {
            localStorage.setItem("stay_mode", newMode);
        } catch (e) {
            console.error("Failed to save stay_mode to localStorage:", e);
        }
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
