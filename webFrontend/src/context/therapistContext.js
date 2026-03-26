import { s, select } from "framer-motion/client";
import { createContext, useContext } from "react";

export const TherapistContext = createContext({
    therapist: null,
    isTherapistLoading: false,
    setTherapist: () => {},
    selectNewTherapist: () => {},
});

export const useTherapist = () => {
    return useContext(TherapistContext);
}