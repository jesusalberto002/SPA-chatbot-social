import React, { useRef, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import TherapistCard from './TherapistCard'; // We will build this next
import { cn } from "@/lib/utils";
import { useTherapist } from "@/context/therapistContext";

import api from '@/api/axios'; // Assuming you have an API utility for making requests
import { th } from 'framer-motion/client';

const TherapistCarousel = ({ onSelect }) => {
  const { therapist, setTherapist, selectNewTherapist } = useTherapist();
  const [therapists, setTherapists] = useState([]);
  const carouselRef = useRef(null);
  const containerRef = useRef(null); // New ref for the window
  const [width, setWidth] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  const [playingTherapistId, setPlayingTherapistId] = useState(null);
  const previewAudioRef = useRef(null);

  useEffect(() => {
    try {
      const fetchTherapists = async () => {
        setIsLoading(true);
        const response = await api.get("/therapists/get-all");
        setTherapists(response.data);
        setIsLoading(false);
      };
      fetchTherapists();
    } catch (error) {
      console.error("Failed to fetch therapists", error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (carouselRef.current && containerRef.current) {
      // Calculate the difference between the scrolling track and the visible window
      const scrollWidth = carouselRef.current.scrollWidth;
      const containerWidth = containerRef.current.offsetWidth;
      setWidth(scrollWidth > containerWidth ? scrollWidth - containerWidth : 0);
    }
  }, [therapists]);

  const handleVoicePreview = async (therapist) => {
    // 1. If already playing, stop it
    if (playingTherapistId === therapist.id) {
        previewAudioRef.current?.pause();
        setPlayingTherapistId(null);
        return;
    }

    // 2. Clear any existing audio
    if (previewAudioRef.current) {
        previewAudioRef.current.pause();
    }

    setPlayingTherapistId(therapist.id);

    try {
        // You can use your existing backend logic here
        // For the preview, maybe just a short intro sentence
        const introText = `Hi, I am ${therapist.name}. I am an Australian therapist specialized in general therapy.`;
        const response = await api.post("/chat/send", {
            message: introText,
            responseType: 'AUDIO_ONLY',
            therapistId: therapist.id,
        });

        if (response.data.audioChunks?.[0]) {
            const audio = new Audio(`data:audio/wav;base64,${response.data.audioChunks[0]}`);
            previewAudioRef.current = audio;
            audio.play();
            audio.onended = () => setPlayingTherapistId(null);
        }
    } catch (err) {
        console.error("Preview failed", err);
        setPlayingTherapistId(null);
    }
  };

  const handleTherapistSelection = async (therapist) => {
      selectNewTherapist(therapist); // Update global context
      onSelect(); // Notify parent component
  }

  return (
    <div className="relative w-full overflow-visible">
      {/* 1. We keep 'overflow-x-auto' on all screens to allow horizontal scrolling.
          2. We removed 'md:grid' so they never stack.
          3. 'md:justify-center' will center the cards IF there is enough space.
      */}
      <div className="overflow-x-auto overflow-y-visible scrollbar-hide py-4">
        <div className={cn(
          "flex gap-6 px-8 pb-8 pt-4 overflow-x-auto overflow-y-visible snap-x snap-mandatory scrollbar-hide",
          "md:px-12"
        )}>
          {therapists.map((therapist) => (
            <div 
              key={therapist.id}
              /* DESKTOP WIDTH & CENTERING:
                 - w-[min(300px,85vw)]: Mobile width logic.
                 - md:min-w-[420px]: Ensures cards are wider on desktop.
                 - md:flex-shrink-0: Critical so they don't squish to fit the screen.
              */
              className="snap-center flex-shrink-0 w-[min(300px,85vw)] md:w-auto md:min-w-[420px]"
            >
              <TherapistCard 
                therapist={therapist} 
                isPlaying={playingTherapistId === therapist.id}
                onPlay={handleVoicePreview}
                onSelect={handleTherapistSelection} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TherapistCarousel;