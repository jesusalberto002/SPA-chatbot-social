"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react"; // For the upload icon
import toastService from "@/services/toastService"; // Assuming you have a toast service for notifications

const tagsList = [
    'HEALTH', 'FITNESS', 'NUTRITION', 'WELLNESS', 'MENTAL_HEALTH', 'LIFESTYLE', 
    'HEALTHY_HABITS', 'SELF_CARE', 'WORK_LIFE_BALANCE', 'MINDFULNESS', 'MEDITATION', 
    'BURNOUT_PREVENTION', 'SUBSTANCE_ABUSE', 'DIGITAL_DETOX', 'SLEEP_HEALTH', 
    'HEALTHY_EATING', 'WORK_STRESS', 'TRAUMA', 'SOCIAL_ANXIETY', 'DEPRESSION', 
    'ANXIETY', 'LOW_SELF_ESTEEM', 'LONELINESS', 'GRIEF_AND_LOSS', 'PANIC_ATTACKS', 
    'COUPLES_THERAPY', 'FAMILY_THERAPY', 'INDIVIDUAL_THERAPY', 'GROUP_THERAPY', 
    'PSYCHOTHERAPY', 'COGNITIVE_BEHAVIORAL_THERAPY', 'DIALOGUE_THERAPY', 
    'PSYCHOANALYSIS', 'HUMANISTIC_THERAPY', 'EXISTENTIAL_THERAPY', 'BEHAVIORAL_THERAPY', 
    'ART_THERAPY', 'MUSIC_THERAPY', 'PLAY_THERAPY', 'DRAMA_THERAPY', 'NARRATIVE_THERAPY', 
    'SOLUTION_FOCUSED_THERAPY', 'MINDFULNESS_BASED_STRESS_REDUCTION', 
    'ACCEPTANCE_AND_COMMITMENT_THERAPY', 'EMOTION_FOCUSED_THERAPY', 
    'INTERPERSONAL_THERAPY', 'SCHEMA_THERAPY', 'TRANSACTIONAL_ANALYSIS', 
    'SYSTEMIC_THERAPY', 'FAMILY_SYSTEMS_THERAPY', 'MULTICULTURAL_THERAPY', 
    'CULTURAL_THERAPY', 'CROSS_CULTURAL_THERAPY', 'TRANSCULTURAL_THERAPY', 
    'SPIRITUAL_THERAPY', 'TRANSPERSONAL_THERAPY', 'SOMATIC_THERAPY', 
    'BODY_CENTRED_THERAPY', 'RELATIONSHIPS', 'COMMUNICATION', 'CONFLICT_RESOLUTION', 
    'EMOTIONAL_INTELLIGENCE', 'POSITIVE_PSYCHOLOGY', 'OTHER'
];

export default function CreateCommunityModal({ onCreate, onCancel }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [bannerImage, setBannerImage] = useState(null);
    const [bannerPreview, setBannerPreview] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);

    const handleCreate = () => {
        // Basic validation
        if (name.trim()) {
            // Pass the name, description, and image file back to the parent
            onCreate({ name, description, bannerImage, tags: selectedTags });
        }
    };

    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBannerImage(file);
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    const handleTagClick = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(prev => prev.filter(t => t !== tag));
        } else {
            if (selectedTags.length < 5) {
                setSelectedTags(prev => [...prev, tag]);
            } else {
                toastService.info("You can select a maximum of 5 tags.");
            }
        }
    };

    return (
        <motion.div
            className="modal p-6 shadow-2xl w-full max-w-2xl rounded-lg" // Made modal slightly wider
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <h3 className="text-xl font-semibold main-text mb-6">Create a New Community</h3>
            <div className="space-y-6">
                <div>
                    <label htmlFor="communityName" className="block text-sm font-medium secondary-text mb-1">
                        Community Name
                    </label>
                    <input
                        id="communityName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Health and Lifestyle"
                        className="w-full form-input rounded-md p-2"
                    />
                </div>

                {/* New Banner Upload Section */}
                <div>
                    <label className="block text-sm font-medium secondary-text mb-1">
                        Banner Image (Optional)
                    </label>
                    <div 
                        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 rounded-md"
                        style={{ borderColor: 'var(--border-secondary)', borderStyle: 'dashed' }}
                    >
                        <div className="space-y-1 text-center">
                            {bannerPreview ? (
                                <img src={bannerPreview} alt="Banner Preview" className="mx-auto h-24 w-auto rounded-md" />
                            ) : (
                                <UploadCloud className="mx-auto h-12 w-12" style={{ color: 'var(--text-tertiary)'}} />
                            )}
                            <div className="flex text-sm" style={{ color: 'var(--text-secondary)'}}>
                                <label
                                    htmlFor="banner-upload"
                                    className="relative cursor-pointer rounded-md font-medium transition-colors duration-200"
                                    style={{ color: 'var(--brand-purple)'}}
                                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                                >
                                    <span>Upload a file</span>
                                    <input id="banner-upload" name="banner-upload" type="file" className="sr-only" onChange={handleBannerChange} accept="image/*" />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs" style={{ color: 'var(--text-tertiary)'}}>
                                PNG, JPG, GIF up to 10MB
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="communityDescription" className="block text-sm font-medium secondary-text mb-1">
                        Description
                    </label>
                    <textarea
                        id="communityDescription"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="A brief description of your community's purpose."
                        className="w-full form-input rounded-md p-2"
                        rows="3"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium secondary-text mb-1">Tags (select max. 5 tags)</label>
                    <div className="max-h-48 overflow-y-auto custom-scrollbar p-2 rounded-md border" style={{ borderColor: 'var(--border-secondary)' }}>
                        <div className="flex flex-wrap gap-2">
                            {tagsList.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => handleTagClick(tag)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                        selectedTags.includes(tag) 
                                            ? 'bg-purple-600 text-white' 
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    {tag.replace(/_/g, ' ').toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-4 mt-8">
                <button onClick={onCancel} className="px-4 py-2 rounded-lg button-secondary transition-colors">
                    Cancel
                </button>
                <button onClick={handleCreate} className="px-4 py-2 rounded-lg button-primary transition-colors font-semibold">
                    Create Community
                </button>
            </div>
        </motion.div>
    );
};