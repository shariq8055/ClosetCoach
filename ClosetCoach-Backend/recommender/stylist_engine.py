def stylist_recommendation(
    gender,
    weather,
    mood,
    occasion
):
    """
    Human stylist rule engine
    """

    outfit = {}
    reasoning = []

    # ---------------- NORMALIZE INPUTS ----------------
    gender = gender.lower()
    weather = weather.lower()
    mood = mood.lower()
    occasion = occasion.lower()

    # ---------------- MOOD → COLOR THEORY ----------------
    mood_palette = {
        "happy": ["white", "yellow", "sky blue"],
        "positive": ["white", "pastel blue"],
        "calm": ["beige", "grey", "pastel"],
        "sad": ["soft blue", "muted grey"],
        "angry": ["muted tones", "soft neutrals"],
        "neutral": ["earth tones"]
    }

    colors = mood_palette.get(mood, ["neutral"])

    reasoning.append(f"Colors selected based on {mood} mood using color psychology")

    # ---------------- WEATHER RULES ----------------
    if weather == "hot":
        fabric = "cotton / linen"
        layer_allowed = False
        reasoning.append("Hot weather → breathable fabrics, no heavy layers")

    elif weather == "cold":
        fabric = "wool / fleece"
        layer_allowed = True
        reasoning.append("Cold weather → warm layers required")

    else:
        fabric = "cotton blend"
        layer_allowed = True

    # ---------------- OCCASION RULES ----------------
    if occasion == "office":
        base_style = "structured"
        reasoning.append("Office occasion → clean and formal styling")

    elif occasion == "party":
        base_style = "trendy"
        reasoning.append("Party occasion → statement and contrast styling")

    else:
        base_style = "casual"
        reasoning.append("Casual occasion → comfort-first styling")

    # ---------------- GENDER RULES ----------------
    if gender == "male":
        top_options = ["solid t-shirt", "formal shirt"]
        bottom_options = ["pants", "chinos"]
        layer_options = ["jacket", "overshirt"]

    elif gender == "female":
        top_options = ["blouse", "fitted top", "dress"]
        bottom_options = ["pants", "skirt"]
        layer_options = ["cardigan", "jacket"]

    else:  # neutral
        top_options = ["relaxed top"]
        bottom_options = ["comfortable bottom"]
        layer_options = ["light layer"]

    # ---------------- FINAL SELECTION ----------------
    outfit["Top"] = top_options[0]
    outfit["Bottom"] = bottom_options[0]

    if layer_allowed:
        outfit["Layer"] = layer_options[0]

    outfit["Fabric"] = fabric
    outfit["Color Palette"] = colors

    # ---------------- TREND INJECTION (SAFE) ----------------
    outfit["Trend"] = "minimalist, relaxed fit, earth-tone inspired"

    reasoning.append("Incorporated evergreen fashion trends (minimalism, earth tones)")

    return outfit, reasoning