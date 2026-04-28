import json
import pathlib
import urllib.parse
import urllib.request


API_URL = "https://bg3.wiki/w/api.php"
HEADERS = {"User-Agent": "DigitalDNDTableIconFetcher/1.0"}
TARGET_DIRECTORY = pathlib.Path("src/assets/actions/spells")

SPELL_ICON_MAPPINGS = {
    "firebolt": (
        "Fire_Bolt_Unfaded_Icon.webp",
        ["Fire Bolt Unfaded Icon.webp"],
    ),
    "booming-blade": (
        "Booming_Blade_Unfaded_Icon.webp",
        ["Booming Blade Unfaded Icon.webp"],
    ),
    "mage-hand": (
        "Mage_Hand_Unfaded_Icon.webp",
        ["Mage Hand Unfaded Icon.webp"],
    ),
    "bless": (
        "Bless_Unfaded_Icon.webp",
        ["Bless Unfaded Icon.webp"],
    ),
    "shield": (
        "Shield_spell_Unfaded_Icon.webp",
        ["Shield spell Unfaded Icon.webp", "Shield Unfaded Icon.webp"],
    ),
    "healing-word": (
        "Healing_Word_Unfaded_Icon.webp",
        ["Healing Word Unfaded Icon.webp"],
    ),
    "mirror-image": (
        "Mirror_Image_Unfaded_Icon.webp",
        ["Mirror Image Unfaded Icon.webp"],
    ),
    "suggestion": (
        "Suggestion_Unfaded_Icon.webp",
        ["Suggestion Unfaded Icon.webp", "Psionic Suggestion Hush Unfaded Icon.webp"],
    ),
    "cure-wounds": (
        "Cure_Wounds_Unfaded_Icon.webp",
        ["Cure Wounds Unfaded Icon.webp"],
    ),
    "detect-evil-and-good": (
        "Detect_Evil_and_Good_Unfaded_Icon.webp",
        ["Detect Evil and Good Unfaded Icon.webp"],
    ),
    "heroism": (
        "Heroism_Unfaded_Icon.webp",
        ["Heroism Unfaded Icon.webp"],
    ),
    "searing-smite": (
        "Searing_Smite_Unfaded_Icon.webp",
        ["Searing Smite Unfaded Icon.webp"],
    ),
    "magic-weapon": (
        "Magic_Weapon_Unfaded_Icon.webp",
        ["Magic Weapon Unfaded Icon.webp"],
    ),
    "aid": (
        "Aid_Unfaded_Icon.webp",
        ["Aid Unfaded Icon.webp"],
    ),
    "lesser-restoration": (
        "Lesser_Restoration_Unfaded_Icon.webp",
        ["Lesser Restoration Unfaded Icon.webp"],
    ),
    "protection-from-poison": (
        "Protection_from_Poison_Unfaded_Icon.webp",
        ["Protection from Poison Unfaded Icon.webp"],
    ),
    "abjure-enemy": (
        "Abjure_Enemy_Unfaded_Icon.webp",
        ["Abjure Enemy Unfaded Icon.webp"],
    ),
    "bane": (
        "Bane_Unfaded_Icon.webp",
        ["Bane spell Unfaded Icon.webp"],
    ),
    "hunters-mark": (
        "Hunters_Mark_Unfaded_Icon.webp",
        ["Hunter's Mark Unfaded Icon.webp"],
    ),
    "hold-person": (
        "Hold_Person_Unfaded_Icon.webp",
        ["Hold Person Unfaded Icon.webp"],
    ),
    "misty-step": (
        "Misty_Step_Unfaded_Icon.webp",
        ["Misty Step Unfaded Icon.webp"],
    ),
    "ceremony": (
        "Sanctuary_Unfaded_Icon.webp",
        ["Sanctuary Unfaded Icon.webp"],
    ),
    "blade-of-blood-and-bone": (
        "Inflict_Wounds_Unfaded_Icon.webp",
        ["Inflict Wounds Unfaded Icon.webp"],
    ),
    "detect-magic": (
        "Detect_Thoughts_Unfaded_Icon.webp",
        ["Detect Thoughts Unfaded Icon.webp"],
    ),
    "infernal-challenge": (
        "Hellish_Rebuke_Unfaded_Icon.webp",
        ["Hellish Rebuke Unfaded Icon.webp"],
    ),
}


def get_file_url(file_title: str) -> str | None:
    params = urllib.parse.urlencode(
        {
            "action": "query",
            "titles": f"File:{file_title}",
            "prop": "imageinfo",
            "iiprop": "url",
            "format": "json",
        },
    )
    request = urllib.request.Request(f"{API_URL}?{params}", headers=HEADERS)

    with urllib.request.urlopen(request, timeout=30) as response:
        payload = json.loads(response.read().decode("utf-8"))

    pages = payload.get("query", {}).get("pages", {})
    page = next(iter(pages.values()), {})
    info = page.get("imageinfo")

    if not info:
        return None

    return info[0]["url"]


def main() -> None:
    TARGET_DIRECTORY.mkdir(parents=True, exist_ok=True)

    downloaded: list[tuple[str, str, str]] = []
    failed: list[tuple[str, str, str]] = []

    for ability_id, (output_name, source_titles) in SPELL_ICON_MAPPINGS.items():
        try:
            source_url = None
            resolved_source_title = None

            for source_title in source_titles:
                source_url = get_file_url(source_title)

                if source_url:
                    resolved_source_title = source_title
                    break

            if not source_url:
                failed.append((ability_id, source_titles[0], "missing imageinfo"))
                continue

            download_request = urllib.request.Request(source_url, headers=HEADERS)

            with urllib.request.urlopen(download_request, timeout=30) as response:
                (TARGET_DIRECTORY / output_name).write_bytes(response.read())

            downloaded.append(
                (
                    ability_id,
                    output_name,
                    resolved_source_title or source_titles[0],
                ),
            )
        except Exception as error:  # noqa: BLE001
            failed.append((ability_id, source_titles[0], str(error)))

    print(f"Downloaded: {len(downloaded)}")
    for ability_id, output_name, source_title in downloaded:
        print(f"- {ability_id} => {output_name} <= {source_title}")

    print(f"Failed: {len(failed)}")
    for ability_id, source_title, reason in failed:
        print(f"- {ability_id} <= {source_title} | {reason}")


if __name__ == "__main__":
    main()
