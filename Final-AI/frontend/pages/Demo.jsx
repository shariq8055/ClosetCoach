import { useState, useEffect } from "react";
import Modal from "../src/components/Modal";
import { generateOutfitDemo, completeOutfitDemo } from "../src/api";

const Demo = () => {
    // Tab state: 'generate' or 'complete'
    const [activeTab, setActiveTab] = useState("generate");

    /* =========================
       Scroll Animation
       ========================= */
    useEffect(() => {
        const items = document.querySelectorAll(".reveal");

        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("active");
                    }
                });
            },
            { threshold: 0.15 }
        );

        items.forEach(item => observer.observe(item));

        return () => items.forEach(item => observer.unobserve(item));
    }, []);

    // Task 1: Generate Outfit state
    const [generateForm, setGenerateForm] = useState({
        gender: "",
        mood: "",
        occasion: "",
        weather: ""
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [showGenerateResult, setShowGenerateResult] = useState(false);
    const [generateResult, setGenerateResult] = useState(null);
    const [generateError, setGenerateError] = useState(null);

    // Task 2: Complete Outfit state
    const [completeForm, setCompleteForm] = useState({
        gender: "",
        category: "",
        mood: "",
        occasion: "",
        weather: ""
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isCompleting, setIsCompleting] = useState(false);
    const [showCompleteResult, setShowCompleteResult] = useState(false);
    const [completeResult, setCompleteResult] = useState(null);
    const [completeError, setCompleteError] = useState(null);

    // Handlers for Task 1
    const handleGenerateChange = (key, value) => {
        setGenerateForm({ ...generateForm, [key]: value });
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setGenerateError(null);

        try {
            const result = await generateOutfitDemo({
                gender: generateForm.gender,
                mood: generateForm.mood,
                occasion: generateForm.occasion,
                weather: generateForm.weather
            });

            if (result.success) {
                setGenerateResult(result);
                setShowGenerateResult(true);
            } else {
                setGenerateError(result.error || "Failed to generate outfit");
            }
        } catch (error) {
            setGenerateError("Could not connect to the ML server. Please make sure the backend is running.");
        } finally {
            setIsGenerating(false);
        }
    };

    const resetGenerate = () => {
        setGenerateForm({ gender: "", mood: "", occasion: "", weather: "" });
        setShowGenerateResult(false);
        setGenerateResult(null);
        setGenerateError(null);
    };

    // Handlers for Task 2
    const handleCompleteChange = (key, value) => {
        setCompleteForm({ ...completeForm, [key]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file');
                return;
            }
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleComplete = async () => {
        setIsCompleting(true);
        setCompleteError(null);

        try {
            const result = await completeOutfitDemo({
                imageFile: image,
                gender: completeForm.gender,
                category: completeForm.category,
                mood: completeForm.mood,
                occasion: completeForm.occasion,
                weather: completeForm.weather
            });

            if (result.success) {
                setCompleteResult(result);
                setShowCompleteResult(true);
            } else {
                setCompleteError(result.error || "Failed to find matching items");
            }
        } catch (error) {
            setCompleteError("Could not connect to the ML server. Please make sure the backend is running.");
        } finally {
            setIsCompleting(false);
        }
    };

    const resetComplete = () => {
        setCompleteForm({ gender: "", category: "", mood: "", occasion: "", weather: "" });
        setImage(null);
        setImagePreview(null);
        setShowCompleteResult(false);
        setCompleteResult(null);
        setCompleteError(null);
    };

    const isGenerateFormComplete = generateForm.gender && generateForm.mood && generateForm.occasion && generateForm.weather;
    const isCompleteFormComplete = image && completeForm.gender && completeForm.category && completeForm.mood && completeForm.occasion && completeForm.weather;

    return (
        <main className="cc-demo-page">
            {/* Header Section */}
            <section className="cc-demo-header">
                <div className="cc-demo-badge fade-in-up">
                    <span className="cc-badge-icon">🧪</span>
                    <span>ML-Powered Dataset Demo</span>
                </div>
                <h1 className="fade-in-up delay-1">Experience AI Fashion Styling</h1>
                <p className="fade-in-up delay-2">
                    Try our pre-trained ML models powered by curated fashion datasets.
                    Generate complete outfits or find matching items — all without signing up!
                    This demo showcases our core AI technology using sample data.
                </p>
                <div className="cc-demo-disclaimer fade-in-up delay-3">
                    <span className="cc-disclaimer-icon">ℹ️</span>
                    <span>Results come from our training dataset of 50,000+ fashion items — not your personal wardrobe</span>
                </div>
            </section>

            {/* Tab Navigation */}
            <div className="cc-demo-tabs fade-in-up delay-4">
                <button
                    className={`cc-demo-tab ${activeTab === "generate" ? "active" : ""}`}
                    onClick={() => setActiveTab("generate")}
                >
                    <span className="cc-tab-icon">✨</span>
                    <div className="cc-tab-content">
                        <span className="cc-tab-title">Generate Outfit</span>
                        <span className="cc-tab-desc">Get complete outfit suggestions</span>
                    </div>
                </button>
                <button
                    className={`cc-demo-tab ${activeTab === "complete" ? "active" : ""}`}
                    onClick={() => setActiveTab("complete")}
                >
                    <span className="cc-tab-icon">🔍</span>
                    <div className="cc-tab-content">
                        <span className="cc-tab-title">Complete My Outfit</span>
                        <span className="cc-tab-desc">Find matching items for your piece</span>
                    </div>
                </button>
            </div>

            {/* Task 1: Generate Outfit Panel */}
            {activeTab === "generate" && (
                <div className="cc-demo-panel slide-in">
                    <div className="cc-demo-panel-header">
                        <div className="cc-ml-badge">
                            <span>🤖</span> Pre-trained Model Active
                        </div>
                        <h2>Generate a Complete Outfit</h2>
                        <p>Select your mood, occasion, and weather to get AI-powered outfit suggestions from our fashion dataset.</p>
                    </div>

                    {/* Error Message */}
                    {generateError && (
                        <div className="cc-demo-error">
                            <span>⚠️</span> {generateError}
                        </div>
                    )}

                    {/* Gender Selection */}
                    <div className="cc-demo-section">
                        <h3>👤 What's your gender?</h3>
                        <div className="cc-option-pills">
                            {[
                                { value: 'female', label: 'Women', desc: 'Women\'s fashion' },
                                { value: 'male', label: 'Men', desc: 'Men\'s fashion' }
                            ].map(option => (
                                <button
                                    key={option.value}
                                    className={`cc-option-pill ${generateForm.gender === option.value ? 'active' : ''}`}
                                    onClick={() => handleGenerateChange('gender', option.value)}
                                >
                                    <span className="cc-pill-label">{option.label}</span>
                                    <span className="cc-pill-desc">{option.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mood Selection */}
                    <div className="cc-demo-section">
                        <h3>💭 What's Your Vibe?</h3>
                        <div className="cc-option-pills">
                            {[
                                { value: 'casual', label: 'Casual', desc: 'Laid-back & easy' },
                                { value: 'confident', label: 'Confident', desc: 'Bold & powerful' },
                                { value: 'relaxed', label: 'Relaxed', desc: 'Calm & comfortable' },
                                { value: 'energetic', label: 'Energetic', desc: 'Active & vibrant' },
                                { value: 'elegant', label: 'Elegant', desc: 'Sophisticated style' }
                            ].map(option => (
                                <button
                                    key={option.value}
                                    className={`cc-option-pill ${generateForm.mood === option.value ? 'active' : ''}`}
                                    onClick={() => handleGenerateChange('mood', option.value)}
                                >
                                    <span className="cc-pill-label">{option.label}</span>
                                    <span className="cc-pill-desc">{option.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Occasion Selection */}
                    <div className="cc-demo-section">
                        <h3>📍 Where Are You Headed?</h3>
                        <div className="cc-option-pills">
                            {[
                                { value: 'daily', label: 'Daily Wear', desc: 'Everyday comfort' },
                                { value: 'college', label: 'College/Office', desc: 'Smart casual' },
                                { value: 'party', label: 'Party', desc: 'Night out ready' },
                                { value: 'formal', label: 'Formal Event', desc: 'Dress to impress' },
                                { value: 'date', label: 'Date Night', desc: 'Impress your partner' }
                            ].map(option => (
                                <button
                                    key={option.value}
                                    className={`cc-option-pill ${generateForm.occasion === option.value ? 'active' : ''}`}
                                    onClick={() => handleGenerateChange('occasion', option.value)}
                                >
                                    <span className="cc-pill-label">{option.label}</span>
                                    <span className="cc-pill-desc">{option.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Weather Selection */}
                    <div className="cc-demo-section">
                        <h3>🌤️ What's the Weather Like?</h3>
                        <div className="cc-option-pills">
                            {[
                                { value: 'hot', label: 'Hot', desc: 'Light & breezy' },
                                { value: 'moderate', label: 'Moderate', desc: 'Just right' },
                                { value: 'cold', label: 'Cold', desc: 'Layer up' },
                                { value: 'rainy', label: 'Rainy', desc: 'Stay dry' }
                            ].map(option => (
                                <button
                                    key={option.value}
                                    className={`cc-option-pill ${generateForm.weather === option.value ? 'active' : ''}`}
                                    onClick={() => handleGenerateChange('weather', option.value)}
                                >
                                    <span className="cc-pill-label">{option.label}</span>
                                    <span className="cc-pill-desc">{option.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generate Button */}
                    <div className="cc-demo-actions">
                        <button
                            className={`cc-primary-btn cc-demo-action-btn ${isGenerating ? 'loading' : ''}`}
                            disabled={!isGenerateFormComplete || isGenerating}
                            onClick={handleGenerate}
                        >
                            {isGenerating ? (
                                <>
                                    <span className="cc-spinner"></span>
                                    <span>Querying ML Model...</span>
                                </>
                            ) : (
                                <>
                                    <span>🧠</span>
                                    <span>Generate Outfit from Dataset</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Dataset Info */}
                    <div className="cc-demo-info">
                        <span className="cc-info-icon">📊</span>
                        <span>Results are generated by our ML model trained on 10,000+ curated outfit combinations</span>
                    </div>
                </div>
            )}

            {/* Task 2: Complete Outfit Panel */}
            {activeTab === "complete" && (
                <div className="cc-demo-panel slide-in">
                    <div className="cc-demo-panel-header">
                        <div className="cc-ml-badge">
                            <span>🎯</span> CIR Model Active
                        </div>
                        <h2>Complete Your Outfit</h2>
                        <p>Upload a clothing item and our Composed Image Retrieval model will find the best matching pieces from our dataset.</p>
                    </div>

                    {/* Error Message */}
                    {completeError && (
                        <div className="cc-demo-error">
                            <span>⚠️</span> {completeError}
                        </div>
                    )}

                    {/* Image Upload */}
                    <div className="cc-demo-section">
                        <h3>📸 Upload Your Item</h3>
                        <label className={`cc-demo-upload ${imagePreview ? 'has-image' : ''}`}>
                            {imagePreview ? (
                                <div className="cc-demo-preview-wrapper">
                                    <img src={imagePreview} alt="Preview" className="cc-demo-preview" />
                                    <span className="cc-demo-change-text">Click to change</span>
                                </div>
                            ) : (
                                <div className="cc-demo-upload-placeholder">
                                    <div className="cc-upload-icon">📷</div>
                                    <span>Drop your clothing image here or click to browse</span>
                                    <span className="cc-upload-hint">Supports JPG, PNG, WebP (max 5MB)</span>
                                </div>
                            )}
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </label>
                    </div>

                    {/* Preferences */}
                    <div className="cc-demo-section">
                        <h3>⚙️ Your Preferences</h3>
                        <div className="cc-demo-selects">
                            <div className="cc-demo-select-group">
                                <label>Gender</label>
                                <select
                                    value={completeForm.gender}
                                    onChange={(e) => handleCompleteChange('gender', e.target.value)}
                                >
                                    <option value="">Select gender</option>
                                    <option value="female">Women</option>
                                    <option value="male">Men</option>
                                </select>
                            </div>
                            <div className="cc-demo-select-group">
                                <label>Item Type</label>
                                <select
                                    value={completeForm.category}
                                    onChange={(e) => handleCompleteChange('category', e.target.value)}
                                >
                                    <option value="">What did you upload?</option>
                                    <option value="top">Top (Shirt, Blouse, etc.)</option>
                                    <option value="pants">Bottom (Pants, Skirt, etc.)</option>
                                </select>
                            </div>
                            <div className="cc-demo-select-group">
                                <label>Mood</label>
                                <select
                                    value={completeForm.mood}
                                    onChange={(e) => handleCompleteChange('mood', e.target.value)}
                                >
                                    <option value="">Select your vibe</option>
                                    <option value="casual">Casual & Relaxed</option>
                                    <option value="confident">Confident & Bold</option>
                                    <option value="elegant">Elegant & Sophisticated</option>
                                    <option value="energetic">Energetic & Vibrant</option>
                                </select>
                            </div>
                            <div className="cc-demo-select-group">
                                <label>Occasion</label>
                                <select
                                    value={completeForm.occasion}
                                    onChange={(e) => handleCompleteChange('occasion', e.target.value)}
                                >
                                    <option value="">Where are you going?</option>
                                    <option value="daily">Daily Wear</option>
                                    <option value="office">Office / Work</option>
                                    <option value="party">Party / Night Out</option>
                                    <option value="formal">Formal Event</option>
                                </select>
                            </div>
                            <div className="cc-demo-select-group">
                                <label>Weather</label>
                                <select
                                    value={completeForm.weather}
                                    onChange={(e) => handleCompleteChange('weather', e.target.value)}
                                >
                                    <option value="">What's the weather?</option>
                                    <option value="hot">Hot & Sunny</option>
                                    <option value="warm">Warm & Pleasant</option>
                                    <option value="cool">Cool & Breezy</option>
                                    <option value="cold">Cold & Chilly</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Complete Button */}
                    <div className="cc-demo-actions">
                        <button
                            className={`cc-primary-btn cc-demo-action-btn ${isCompleting ? 'loading' : ''}`}
                            disabled={!isCompleteFormComplete || isCompleting}
                            onClick={handleComplete}
                        >
                            {isCompleting ? (
                                <>
                                    <span className="cc-spinner"></span>
                                    <span>Finding Matches...</span>
                                </>
                            ) : (
                                <>
                                    <span>🔍</span>
                                    <span>Find Matching Items</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Dataset Info */}
                    <div className="cc-demo-info">
                        <span className="cc-info-icon">🎯</span>
                        <span>Our CIR model searches through 50,000+ fashion items for the best style matches</span>
                    </div>
                </div>
            )}

            {/* How It Works Section */}
            <section className="cc-demo-how-it-works reveal">
                <h2>How Our Demo Works</h2>
                <div className="cc-how-grid">
                    <div className="cc-how-card reveal">
                        <div className="cc-how-number">1</div>
                        <h4>Sample Dataset</h4>
                        <p>We use a curated dataset of 50,000+ fashion items with pre-computed style embeddings</p>
                    </div>
                    <div className="cc-how-card reveal">
                        <div className="cc-how-number">2</div>
                        <h4>ML Processing</h4>
                        <p>Your preferences are processed by our trained neural networks to understand style context</p>
                    </div>
                    <div className="cc-how-card reveal">
                        <div className="cc-how-number">3</div>
                        <h4>Smart Matching</h4>
                        <p>AI finds the best outfit combinations based on fashion compatibility principles</p>
                    </div>
                </div>
                <div className="cc-upgrade-note reveal">
                    <span>💡</span>
                    <span><strong>Want personalized results?</strong> Sign up to upload your wardrobe and get suggestions from your own clothes!</span>
                </div>
            </section>

            {/* Generate Result Modal */}
            <Modal
                isOpen={showGenerateResult}
                onClose={() => setShowGenerateResult(false)}
                title="Generated Outfit from Dataset"
            >
                <div className="cc-demo-result">
                    <div className="cc-demo-result-badge">
                        <span>🧪</span> ML Model Result
                    </div>

                    <div className="cc-demo-result-summary">
                        <div className="cc-result-item">
                            <span className="cc-result-label">Mood</span>
                            <span className="cc-result-value">{generateForm.mood}</span>
                        </div>
                        <div className="cc-result-item">
                            <span className="cc-result-label">Occasion</span>
                            <span className="cc-result-value">{generateForm.occasion}</span>
                        </div>
                        <div className="cc-result-item">
                            <span className="cc-result-label">Weather</span>
                            <span className="cc-result-value">{generateForm.weather}</span>
                        </div>
                    </div>

                    {/* Display actual outfit image from backend */}
                    {generateResult?.outfitImage && (
                        <div className="cc-demo-outfit-image">
                            <h4>✨ Your AI-Generated Outfit:</h4>
                            <img
                                src={`data:image/png;base64,${generateResult.outfitImage}`}
                                alt="Generated Outfit"
                                className="cc-generated-outfit-img"
                            />
                        </div>
                    )}

                    {/* Display outfit details */}
                    {generateResult?.outfit && (
                        <div className="cc-demo-outfit-result">
                            <h4>🧠 Outfit Components:</h4>
                            <div className="cc-demo-outfit-items">
                                {Object.entries(generateResult.outfit).map(([key, value]) => (
                                    <div key={key} className="cc-demo-outfit-item">
                                        <span className="cc-outfit-category">{key}</span>
                                        <span className="cc-outfit-name">{Array.isArray(value) ? value.join(", ") : value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Display reasoning */}
                    {generateResult?.reasoning && (
                        <div className="cc-demo-reasoning">
                            <h4>💡 Stylist Reasoning:</h4>
                            <ul>
                                {generateResult.reasoning.map((reason, idx) => (
                                    <li key={idx}>{reason}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="cc-demo-result-note">
                        <span>💡</span>
                        <span>This suggestion was generated from our training dataset. <strong>Sign up</strong> to get personalized suggestions from your own wardrobe!</span>
                    </div>

                    <div className="cc-result-actions">
                        <button className="cc-secondary-btn" onClick={resetGenerate}>
                            Try Again
                        </button>
                        <button className="cc-primary-btn" onClick={() => setShowGenerateResult(false)}>
                            Got It!
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Complete Result Modal */}
            <Modal
                isOpen={showCompleteResult}
                onClose={() => setShowCompleteResult(false)}
                title="Matching Items from Dataset"
            >
                <div className="cc-demo-result">
                    <div className="cc-demo-result-badge">
                        <span>🎯</span> CIR Model Results
                    </div>

                    {imagePreview && (
                        <div className="cc-demo-query-image">
                            <span>Your Uploaded Item:</span>
                            <img src={imagePreview} alt="Query" />
                        </div>
                    )}

                    {/* Display actual matches from backend */}
                    {completeResult?.matches && completeResult.matches.length > 0 ? (
                        <div className="cc-demo-matches">
                            <h4>🔍 Best Matches Found:</h4>
                            {completeResult.matches.map((match, index) => (
                                <div key={index} className="cc-demo-match-item">
                                    {match.imageBase64 && (
                                        <img
                                            src={`data:image/jpeg;base64,${match.imageBase64}`}
                                            alt={match.category}
                                            className="cc-match-image"
                                        />
                                    )}
                                    <div className="cc-match-info">
                                        <span className="cc-match-name">{match.category}</span>
                                        <span className="cc-match-category">Score: {match.score}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="cc-demo-no-matches">
                            <p>No matching items found. Try uploading a different image.</p>
                        </div>
                    )}

                    {/* Display reasoning */}
                    {completeResult?.reasoning && (
                        <div className="cc-demo-reasoning">
                            <h4>💡 Why these matches:</h4>
                            <ul>
                                {completeResult.reasoning.map((reason, idx) => (
                                    <li key={idx}>{reason}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="cc-demo-result-note">
                        <span>💡</span>
                        <span>These matches are from our training dataset. <strong>Upload your wardrobe</strong> to find matches from your own clothes!</span>
                    </div>

                    <div className="cc-result-actions">
                        <button className="cc-secondary-btn" onClick={resetComplete}>
                            Try Again
                        </button>
                        <button className="cc-primary-btn" onClick={() => setShowCompleteResult(false)}>
                            Got It!
                        </button>
                    </div>
                </div>
            </Modal>
        </main>
    );
};

export default Demo;
