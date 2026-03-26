import { useEffect, useState } from "react";
import api from '@/api/axios'; // Assuming you have an API utility for making requests
import toastService from "@/services/toastService";
import { toast } from "react-toastify";
import { TherapistContext } from "./therapistContext";
import { useAuth } from "./authContext";
import { set } from "date-fns";

export const TherapistProvider = ({ children }) => {
    const [therapist, setTherapist] = useState(null);
    const [isTherapistLoading, setIsTherapistLoading] = useState(true);
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

    useEffect(() => {
        if (isAuthLoading) return;

        // 2. If Auth finished and user is NOT logged in, stop loading and clear state
        if (!isAuthenticated) {
        setTherapist(null);
        setIsTherapistLoading(false);
        return;
        }

        const fetchTherapist = async () => {
            setIsTherapistLoading(true);
            try {
                console.log("Fetching selected therapist...");
                const response = await api.get("/therapists/get-selected");
                // Handle cases where response data might be an array or a single object
                // We receive an array of therapists in case future updates allow multiple therapists
                // but for now we just take the first one.
                const therapistData = Array.isArray(response.data) ? response.data[0] : response.data;
                setTherapist(therapistData);
            } catch (error) {
                console.error("Failed to fetch selected therapist", error);
                toastService.error("Failed to load your therapist. Please try again.");
            } finally {
                setIsTherapistLoading(false);
                console.log("Finished fetching therapist. Loading state:", false);
            }
        };
        fetchTherapist();
    }, [isAuthenticated, isAuthLoading]);

    const selectNewTherapist = async (therapist) => {
      try {
        console.log("Selected therapist:", therapist.id);
        const response = await api.post("/therapists/update", {
            therapistId: therapist.id
        });
        
        setTherapist(therapist);
        
        toastService.success("Therapist updated successfully!");

      } catch (error) {
        console.error("Failed to update therapist selection", error);  
      }
  }

    const value = {
        therapist,
        isTherapistLoading,
        setTherapist, // Expose setter to allow updates from components
        selectNewTherapist, // Expose the selection handler
    };

    return (
        <TherapistContext.Provider value={value}>
            {children}
        </TherapistContext.Provider>
    );
}