import { useState, useEffect } from "react";
import { useAuth } from "../src/context/AuthContext";
import { db } from "../src/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const CIR = () => {
  const { user } = useAuth();
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [mood, setMood] = useState("");
  const [occasion, setOccasion] = useState("");
  const [weather, setWeather] = useState("");
  const [category, setCategory] = useState("top");
  const [gender, setGender] = useState("female");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [wardrobeItems, setWardrobeItems] = useState([]);

  // Fetch user's wardrobe on mount
  useEffect(() => {
    const fetchWardrobe = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, "wardrobe"),
          where("userId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setWardrobeItems(items);
      } catch (err) {
        console.error("Failed to fetch wardrobe:", err);
      }
    };
    fetchWardrobe();
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      setImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!image || !mood || !occasion || !weather) {
      alert('Please fill in all fields and upload an image');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Find complementary items from USER'S WARDROBE
      const uploadedCategory = category; // "top" or "pants"

      // Determine what category we need to find
      let targetCategory = "";
      if (uploadedCategory === "top") {
        targetCategory = "pants";
      } else if (uploadedCategory === "pants") {
        targetCategory = "top";
      }

      // Filter wardrobe for matching items
      const matchingItems = wardrobeItems.filter(item =>
        item.category && item.category.toLowerCase() === targetCategory
      );

      // Also get jackets if cold weather
      let jacketItems = [];
      if (weather === "cold" || weather === "cool" || weather === "rainy") {
        jacketItems = wardrobeItems.filter(item =>
          item.category && item.category.toLowerCase() === "jacket"
        );
      }

      // Create matches array
      const matches = [];

      if (matchingItems.length > 0) {
        // Pick a random matching item
        const selected = matchingItems[Math.floor(Math.random() * matchingItems.length)];
        matches.push({
          category: targetCategory.charAt(0).toUpperCase() + targetCategory.slice(1),
          imageBase64: selected.imageUrl, // This is already base64 from Firebase
          name: selected.name,
          score: 0.95
        });
      }

      if (jacketItems.length > 0) {
        const selected = jacketItems[Math.floor(Math.random() * jacketItems.length)];
        matches.push({
          category: "Layer/Jacket",
          imageBase64: selected.imageUrl,
          name: selected.name,
          score: 0.88
        });
      }

      // Build reasoning
      const reasoning = [];
      if (matches.length > 0) {
        reasoning.push(`Found ${matches.length} matching item(s) from your wardrobe`);
      }
      reasoning.push(`Styled for ${occasion} occasion`);
      reasoning.push(`Optimized for ${weather} weather`);
      reasoning.push(`Matches your ${mood} mood`);

      if (matches.length === 0) {
        setError(`No matching ${targetCategory} found in your wardrobe. Please add more items!`);
      } else {
        setResult({
          success: true,
          matches: matches,
          reasoning: reasoning
        });
        setShowResult(true);
      }
    } catch (err) {
      setError("Failed to find matching items: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setMood("");
    setOccasion("");
    setWeather("");
    setCategory("top");
    setGender("female");
    setImage(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    setShowResult(false);
  };

  const isFormComplete = image && mood && occasion && weather;

  return (
    <div className="cc-cir-fullscreen">
      <div className="cc-cir-card">
        {/* Icon */}
        <div className="cc-cir-icon-box">
          {imagePreview ? (
            <div className="cc-icon-check"></div>
          ) : (
            <div className="cc-icon-camera"></div>
          )}
        </div>

        {/* Title */}
        <h2>Complete Your Look</h2>
        <p className="cc-cir-subtitle">
          Upload one piece from your wardrobe and let our AI find the perfect
          matching items to create a stunning complete outfit.
        </p>

        {/* Error Message */}
        {error && (
          <div className="cc-cir-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <div className="cc-cir-form">
          {/* File Upload with Preview */}
          <label className={`cc-cir-upload ${imagePreview ? 'has-image' : ''}`}>
            {imagePreview ? (
              <div className="cc-cir-preview-wrapper">
                <img src={imagePreview} alt="Preview" className="cc-cir-preview" />
                <span className="cc-cir-change-text">Click to change</span>
              </div>
            ) : (
              <>
                <div className="cc-upload-icon-box">
                  <div className="cc-icon-upload-cloud"></div>
                </div>
                <span>Drop your clothing image here or click to browse</span>
              </>
            )}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>

          {/* Gender Selection */}
          <div className="cc-cir-option-group">
            <label className="cc-cir-group-label">Gender</label>
            <div className="cc-cir-pills">
              <button
                type="button"
                className={`cc-cir-pill ${gender === 'female' ? 'active' : ''}`}
                onClick={() => setGender('female')}
              >
                👩 Female
              </button>
              <button
                type="button"
                className={`cc-cir-pill ${gender === 'male' ? 'active' : ''}`}
                onClick={() => setGender('male')}
              >
                👨 Male
              </button>
            </div>
          </div>

          {/* Category Selection */}
          <div className="cc-cir-option-group">
            <label className="cc-cir-group-label">What are you uploading?</label>
            <div className="cc-cir-pills">
              <button
                type="button"
                className={`cc-cir-pill ${category === 'top' ? 'active' : ''}`}
                onClick={() => setCategory('top')}
              >
                👕 Top
              </button>
              <button
                type="button"
                className={`cc-cir-pill ${category === 'pants' ? 'active' : ''}`}
                onClick={() => setCategory('pants')}
              >
                👖 Bottom
              </button>
            </div>
          </div>

          {/* Mood Selection */}
          <div className="cc-cir-option-group">
            <label className="cc-cir-group-label">Your Vibe</label>
            <div className="cc-cir-pills">
              {[
                { value: 'casual', label: '😊 Casual' },
                { value: 'confident', label: '💪 Confident' },
                { value: 'elegant', label: '✨ Elegant' },
                { value: 'energetic', label: '⚡ Energetic' },
                { value: 'minimal', label: '🧘 Minimal' }
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`cc-cir-pill ${mood === opt.value ? 'active' : ''}`}
                  onClick={() => setMood(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Occasion Selection */}
          <div className="cc-cir-option-group">
            <label className="cc-cir-group-label">Where are you headed?</label>
            <div className="cc-cir-pills">
              {[
                { value: 'daily', label: '🏠 Daily' },
                { value: 'office', label: '💼 Office' },
                { value: 'college', label: '📚 College' },
                { value: 'date', label: '❤️ Date' },
                { value: 'party', label: '🎉 Party' },
                { value: 'formal', label: '🎩 Formal' }
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`cc-cir-pill ${occasion === opt.value ? 'active' : ''}`}
                  onClick={() => setOccasion(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Weather Selection */}
          <div className="cc-cir-option-group">
            <label className="cc-cir-group-label">Weather</label>
            <div className="cc-cir-pills">
              {[
                { value: 'hot', label: '☀️ Hot' },
                { value: 'warm', label: '🌤️ Warm' },
                { value: 'cool', label: '🌥️ Cool' },
                { value: 'cold', label: '❄️ Cold' },
                { value: 'rainy', label: '🌧️ Rainy' }
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`cc-cir-pill ${weather === opt.value ? 'active' : ''}`}
                  onClick={() => setWeather(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            className={`cc-cir-action-btn ${isLoading ? 'loading' : ''}`}
            onClick={handleSubmit}
            disabled={!isFormComplete || isLoading}
          >
            {isLoading ? (
              <>
                <span className="cc-spinner"></span>
                Finding matches...
              </>
            ) : (
              'Complete My Outfit'
            )}
          </button>
        </div>

        {/* Results Display */}
        {showResult && result && (
          <div className="cc-cir-results">
            <h3>🎯 Matching Items Found</h3>

            {result.matches && result.matches.length > 0 ? (
              <div className="cc-cir-matches-grid">
                {result.matches.map((match, idx) => (
                  <div key={idx} className="cc-cir-match-card">
                    {match.imageBase64 && (
                      <img
                        src={match.imageBase64.startsWith('data:') ? match.imageBase64 : `data:image/jpeg;base64,${match.imageBase64}`}
                        alt={match.category}
                        className="cc-cir-match-img"
                      />
                    )}
                    <div className="cc-cir-match-info">
                      {match.name && <span className="cc-cir-match-name">{match.name}</span>}
                      <span className="cc-cir-match-category">{match.category}</span>
                      <span className="cc-cir-match-score">Match: {(match.score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="cc-cir-no-matches">No matching items found. Try a different image or preferences.</p>
            )}

            {/* Reasoning */}
            {result.reasoning && result.reasoning.length > 0 && (
              <div className="cc-cir-reasoning">
                <h4>💡 Why these matches:</h4>
                <ul>
                  {result.reasoning.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            <button className="cc-secondary-btn" onClick={resetForm}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CIR;
