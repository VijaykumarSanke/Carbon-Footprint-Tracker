from __future__ import annotations

import re
from typing import List, Literal, Optional

from fastapi import FastAPI, File, Form, UploadFile
from pydantic import BaseModel

app = FastAPI(title="Eco Track AI Service", version="1.0.0")


Category = Literal["transport", "food", "energy"]


class AnalyzeResponse(BaseModel):
    emission: float
    category: Category
    suggestions: List[str]
    insights: str


KEYWORDS = {
    "transport": ["car", "bus", "bike", "travel", "train", "metro", "ride", "trip", "commute"],
    "food": ["food", "eat", "meal", "beef", "burger", "meat", "chicken", "rice", "lunch", "dinner"],
    "energy": ["ac", "electricity", "power", "appliance", "fan", "heater", "washing machine"],
}

TRANSPORT_FACTORS = {
    "car": 0.2,
    "bus": 0.1,
    "bike": 0.0,
    "train": 0.08,
    "metro": 0.06,
}


def round2(value: float) -> float:
    return round(value, 2)


def extract_value(text: str, patterns: list[str], default: float = 1.0) -> float:
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return float(match.group(1))
    return default


def extract_transport(text: str) -> tuple[float, str, float]:
    has_transport = any(keyword in text for keyword in KEYWORDS["transport"]) or bool(
        re.search(r"\d+(?:\.\d+)?\s*(km|kilometers?)", text)
    )
    if not has_transport:
        return 0.0, "", 0.0

    mode = "bike" if "bike" in text else "bus" if "bus" in text else "train" if "train" in text else "metro" if "metro" in text else "car"
    distance = extract_value(text, [r"(\d+(?:\.\d+)?)\s*km", r"(\d+(?:\.\d+)?)\s*kilometers?"], 1.0)
    return round2(distance * TRANSPORT_FACTORS.get(mode, 0.2)), mode, round2(distance)


def extract_food(text: str) -> tuple[float, str]:
    if not any(keyword in text for keyword in KEYWORDS["food"]):
        return 0.0, ""

    servings = extract_value(
        text,
        [r"(\d+(?:\.\d+)?)\s*(?:meal|meals|burger|burgers|plate|plates|serving|servings)"],
        1.0,
    )

    if "beef" in text or "burger" in text or "red meat" in text:
        return round2(servings * 7), "beef"
    if "chicken" in text:
        return round2(servings * 3), "chicken"
    if "rice" in text:
        return round2(servings * 1.2), "rice"
    return round2(servings * 1.5), "meal"


def extract_energy(text: str) -> tuple[float, float, str]:
    if not any(keyword in text for keyword in KEYWORDS["energy"]):
        return 0.0, 0.0, ""

    hours = extract_value(text, [r"(\d+(?:\.\d+)?)\s*hours?", r"(\d+(?:\.\d+)?)\s*hrs?"], 1.0)
    source = "ac" if "ac" in text else "electricity"
    return round2(hours * 0.5), round2(hours), source


def get_intensity(total: float) -> str:
    if total >= 8:
        return "high"
    if total >= 3:
        return "medium"
    return "low"


def build_suggestions(
    transport_emission: float,
    transport_mode: str,
    distance_km: float,
    food_emission: float,
    food_type: str,
    energy_emission: float,
    hours: float,
    total: float,
) -> list[str]:
    intensity = get_intensity(total)
    suggestions: list[str] = []

    if transport_emission > 0:
        if transport_mode == "car" and distance_km <= 3:
            suggestions.append(
                f"For a short {distance_km:g} km car trip, walking or cycling would likely remove most of that transport footprint."
            )
        elif transport_mode == "car" and distance_km <= 10:
            suggestions.append(
                f"For trips around {distance_km:g} km, switching one similar drive to public transport could cut transport emissions substantially."
            )
        elif transport_mode == "car":
            suggestions.append(
                "Your car travel is the biggest mobility driver here, so batching trips or carpooling would be the most effective transport change."
            )
        elif transport_mode == "bike":
            suggestions.append(
                "Transport is already low-impact here, so your biggest gains would come from food or energy changes instead."
            )

    if food_emission > 0:
        if food_type == "beef":
            suggestions.append(
                "Replacing beef with chicken or a plant-based option once or twice a week would significantly reduce the food impact of meals like this."
            )
        elif food_type == "chicken":
            suggestions.append(
                "If this chicken meal is a regular habit, mixing in one plant-based alternative each week would steadily lower your food emissions."
            )
        elif food_type == "rice":
            suggestions.append(
                "This is a relatively mild food footprint, and pairing rice with more legumes or vegetables would keep it efficient."
            )
        else:
            suggestions.append(
                "This meal is not especially high impact, so small plant-forward swaps would be enough to improve it."
            )

    if energy_emission > 0:
        if hours >= 5:
            suggestions.append(
                f"Running AC for {hours:g} hours is the main energy driver here, so trimming 1-2 hours would reduce emissions quickly."
            )
        else:
            suggestions.append(
                f"Because cooling ran for {hours:g} hours, using a fan for part of that time would shave off a meaningful share of energy use."
            )

    if transport_emission > 0 and food_emission > 0:
        suggestions.append(
            "This entry combines travel and food emissions, so one lighter meal plus one lower-carbon trip would deliver a bigger reduction than changing only one habit."
        )
    elif transport_emission > 0 and energy_emission > 0:
        suggestions.append(
            "Your footprint is split between mobility and home energy, so pairing shorter AC use with one less car trip would target both sources at once."
        )

    return suggestions[:3] if intensity == "high" else suggestions[:2] if suggestions else ["Track a little more detail so the next recommendation can be more specific."]


def analyze_text(text: str) -> AnalyzeResponse:
    lowered = text.lower()
    transport_emission, transport_mode, distance_km = extract_transport(lowered)
    food_emission, food_type = extract_food(lowered)
    energy_emission, hours, _source = extract_energy(lowered)

    categories = {
        "transport": transport_emission,
        "food": food_emission,
        "energy": energy_emission,
    }
    total = round2(sum(categories.values()))
    primary_category = max(categories, key=categories.get) if total > 0 else "food"
    primary_share = round2((categories[primary_category] / total) * 100) if total > 0 else 0
    active_count = sum(1 for value in categories.values() if value > 0)

    if total <= 0:
        insight = "This activity has little measurable carbon impact based on the details provided."
    elif active_count > 1:
        insight = (
            f"{primary_category.capitalize()} contributed about {primary_share:g}% of this activity's emissions, "
            "with the rest coming from the other actions in the same entry."
        )
    else:
        insight = f"{primary_category.capitalize()} drove nearly all of this activity's footprint at about {total:g} kg CO2e."

    return AnalyzeResponse(
        emission=total,
        category=primary_category,  # type: ignore[arg-type]
        suggestions=build_suggestions(
            transport_emission,
            transport_mode,
            distance_km,
            food_emission,
            food_type,
            energy_emission,
            hours,
            total,
        ),
        insights=insight,
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(
    description: str = Form(""),
    image: Optional[UploadFile] = File(default=None),
) -> AnalyzeResponse:
    image_hint = image.filename if image else ""
    combined_text = f"{description} {image_hint}".strip()
    return analyze_text(combined_text or "meal")
