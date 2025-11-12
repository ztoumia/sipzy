#!/usr/bin/env python3
"""
Script pour générer des données de cafés réalistes basées sur les torréfacteurs français.
Alternative au scraping qui est souvent bloqué par les protections anti-bot.
"""

import csv
import random
from typing import List, Dict

# Données de référence pour générer des cafés réalistes
ORIGINS = [
    'Ethiopia', 'Kenya', 'Colombia', 'Brazil', 'Guatemala',
    'Costa Rica', 'Rwanda', 'Burundi', 'Peru', 'Honduras',
    'El Salvador', 'Tanzania', 'Indonesia', 'Yemen', 'India',
    'Mexico', 'Nicaragua', 'Panama', 'Bolivia', 'Uganda'
]

PROCESSES = ['Washed', 'Natural', 'Honey', 'Semi-Washed', 'Anaerobic']

VARIETIES = [
    'Heirloom', 'Bourbon', 'Caturra', 'Typica', 'SL28', 'SL34',
    'Geisha', 'Catuai', 'Pacamara', 'Maragogype', 'Java', 'Mundo Novo'
]

PRICE_RANGES = ['$$', '$$$', '$$$$']

# Notes de dégustation par catégorie
NOTES = {
    'Fruity': ['Citrus', 'Berry', 'Stone Fruit', 'Tropical Fruit', 'Apple', 'Grape'],
    'Floral': ['Floral', 'Jasmine', 'Rose', 'Lavender'],
    'Chocolatey': ['Chocolate', 'Dark Chocolate', 'Cocoa', 'Milk Chocolate'],
    'Nutty': ['Nutty', 'Almond', 'Hazelnut'],
    'Sweet': ['Caramel', 'Honey', 'Brown Sugar', 'Vanilla'],
    'Earthy': ['Earthy', 'Woody'],
    'Spicy': ['Spicy', 'Cinnamon']
}

# Profils de café typiques par origine
ORIGIN_PROFILES = {
    'Ethiopia': {
        'processes': ['Washed', 'Natural'],
        'varieties': ['Heirloom'],
        'note_categories': ['Fruity', 'Floral', 'Sweet'],
        'altitude_range': (1600, 2200),
        'descriptions': [
            "Café éthiopien aux notes florales et d'agrumes, avec une acidité vive",
            "Café complexe avec des arômes de fruits rouges et jasmin",
            "Profil floral et fruité typique de l'Éthiopie"
        ]
    },
    'Kenya': {
        'processes': ['Washed'],
        'varieties': ['SL28', 'SL34'],
        'note_categories': ['Fruity', 'Sweet'],
        'altitude_range': (1400, 2000),
        'descriptions': [
            "Café kenyan puissant avec une acidité de cassis",
            "Profil intense avec des notes de fruits noirs et caramel",
            "Café équilibré aux arômes de baies et agrumes"
        ]
    },
    'Colombia': {
        'processes': ['Washed'],
        'varieties': ['Caturra', 'Bourbon', 'Typica'],
        'note_categories': ['Sweet', 'Chocolatey', 'Nutty'],
        'altitude_range': (1200, 2000),
        'descriptions': [
            "Café colombien équilibré avec des notes de caramel",
            "Profil doux aux arômes de chocolat et noisette",
            "Café rond et gourmand typique de Colombie"
        ]
    },
    'Brazil': {
        'processes': ['Natural', 'Pulped Natural'],
        'varieties': ['Bourbon', 'Catuai'],
        'note_categories': ['Chocolatey', 'Nutty', 'Sweet'],
        'altitude_range': (900, 1300),
        'descriptions': [
            "Café brésilien doux aux notes de chocolat et noisette",
            "Profil gourmand avec des arômes de caramel",
            "Café corsé typique du Brésil"
        ]
    },
    'Guatemala': {
        'processes': ['Washed'],
        'varieties': ['Bourbon', 'Caturra'],
        'note_categories': ['Chocolatey', 'Spicy', 'Sweet'],
        'altitude_range': (1300, 2000),
        'descriptions': [
            "Café guatémaltèque complexe avec notes de cacao et épices",
            "Profil équilibré aux arômes de chocolat noir",
            "Café corsé avec une belle structure"
        ]
    },
    'Costa Rica': {
        'processes': ['Honey', 'Washed'],
        'varieties': ['Caturra', 'Catuai'],
        'note_categories': ['Sweet', 'Fruity', 'Chocolatey'],
        'altitude_range': (1200, 1800),
        'descriptions': [
            "Café costaricain équilibré aux notes de miel",
            "Profil doux avec des arômes fruités",
            "Café rond et gourmand"
        ]
    }
}

# Noms de cafés typiques
COFFEE_NAME_TEMPLATES = [
    "{origin}",
    "{origin} {variety}",
    "{origin} {region}",
    "{origin} {process}",
    "Single Origin {origin}",
]

REGIONS_BY_ORIGIN = {
    'Ethiopia': ['Yirgacheffe', 'Sidamo', 'Guji', 'Limu', 'Harar'],
    'Kenya': ['Nyeri', 'Kirinyaga', 'Kiambu', 'Muranga'],
    'Colombia': ['Huila', 'Nariño', 'Antioquia', 'Tolima', 'Cauca'],
    'Brazil': ['Sul de Minas', 'Cerrado', 'Mogiana'],
    'Guatemala': ['Antigua', 'Huehuetenango', 'Atitlan'],
    'Costa Rica': ['Tarrazú', 'West Valley', 'Central Valley'],
}


class CoffeeDataGenerator:
    def __init__(self):
        self.generated_names = set()

    def generate_coffees_for_roasters(self, roasters_csv: str, num_coffees_per_roaster: int = 3) -> List[Dict]:
        """Génère des cafés pour chaque torréfacteur."""
        coffees = []

        with open(roasters_csv, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            roasters = list(reader)

        print(f"🔧 Génération de cafés pour {len(roasters)} torréfacteurs...")
        print(f"   {num_coffees_per_roaster} café(s) par torréfacteur\n")

        for roaster in roasters:
            roaster_coffees = self.generate_coffees_for_roaster(
                roaster['name'],
                num_coffees_per_roaster
            )
            coffees.extend(roaster_coffees)

        return coffees

    def generate_coffees_for_roaster(self, roaster_name: str, count: int) -> List[Dict]:
        """Génère des cafés pour un torréfacteur."""
        coffees = []

        # Sélectionner des origines variées
        selected_origins = random.sample(
            list(ORIGIN_PROFILES.keys()),
            min(count, len(ORIGIN_PROFILES))
        )

        for origin in selected_origins:
            coffee = self.generate_coffee(roaster_name, origin)
            coffees.append(coffee)

        return coffees

    def generate_coffee(self, roaster_name: str, origin: str) -> Dict:
        """Génère un café avec des données réalistes."""
        profile = ORIGIN_PROFILES.get(origin, ORIGIN_PROFILES['Colombia'])

        # Sélectionner un processus approprié
        process = random.choice(profile['processes'])

        # Sélectionner une variété appropriée
        variety = random.choice(profile['varieties'])

        # Générer le nom
        name = self.generate_unique_name(origin, variety, process)

        # Sélectionner des notes de dégustation
        notes = self.select_tasting_notes(profile['note_categories'])

        # Générer l'altitude
        altitude_min, altitude_max = profile['altitude_range']
        actual_min = random.randint(altitude_min, altitude_max - 200)
        actual_max = actual_min + random.randint(200, 400)

        # Sélectionner une description
        description = random.choice(profile['descriptions'])

        # Prix aléatoire
        price_range = random.choice(PRICE_RANGES)

        # Année de récolte
        harvest_year = random.choice([2023, 2024])

        return {
            'name': name,
            'roaster_name': roaster_name,
            'origin': origin,
            'process': process,
            'variety': variety,
            'altitude_min': actual_min,
            'altitude_max': actual_max,
            'harvest_year': harvest_year,
            'price_range': price_range,
            'description': description,
            'image_url': '',
            'notes': notes
        }

    def generate_unique_name(self, origin: str, variety: str, process: str) -> str:
        """Génère un nom unique de café."""
        attempts = 0
        while attempts < 10:
            # Essayer d'ajouter une région si disponible
            if origin in REGIONS_BY_ORIGIN and random.random() > 0.5:
                region = random.choice(REGIONS_BY_ORIGIN[origin])
                name = f"{origin} {region}"
            else:
                # Utiliser un template
                template = random.choice(COFFEE_NAME_TEMPLATES)
                name = template.format(
                    origin=origin,
                    variety=variety,
                    process=process,
                    region=random.choice(REGIONS_BY_ORIGIN.get(origin, [''])) if origin in REGIONS_BY_ORIGIN else ''
                ).strip()

            if name not in self.generated_names:
                self.generated_names.add(name)
                return name

            attempts += 1

        # Fallback: ajouter un numéro
        base_name = origin
        counter = 1
        while f"{base_name} #{counter}" in self.generated_names:
            counter += 1
        name = f"{base_name} #{counter}"
        self.generated_names.add(name)
        return name

    def select_tasting_notes(self, categories: List[str], count: int = 3) -> str:
        """Sélectionne des notes de dégustation appropriées."""
        selected_notes = []

        for category in categories:
            if category in NOTES:
                note = random.choice(NOTES[category])
                selected_notes.append(note)

        # S'assurer d'avoir au moins 'count' notes
        while len(selected_notes) < count:
            category = random.choice(list(NOTES.keys()))
            note = random.choice(NOTES[category])
            if note not in selected_notes:
                selected_notes.append(note)

        return ';'.join(selected_notes[:count])

    def save_to_csv(self, coffees: List[Dict], output_file: str):
        """Sauvegarde les cafés dans un CSV."""
        fieldnames = [
            'name', 'roaster_name', 'origin', 'process', 'variety',
            'altitude_min', 'altitude_max', 'harvest_year', 'price_range',
            'description', 'image_url', 'notes'
        ]

        with open(output_file, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(coffees)

        print(f"\n✅ {len(coffees)} cafés générés et sauvegardés dans {output_file}")


def main():
    print("☕ Générateur de données de cafés\n")
    print("=" * 60)

    generator = CoffeeDataGenerator()

    # Générer 3 cafés par torréfacteur
    coffees = generator.generate_coffees_for_roasters(
        'torrefacteurs-france.csv',
        num_coffees_per_roaster=3
    )

    # Sauvegarder
    generator.save_to_csv(coffees, 'coffees-generated.csv')

    print("\n" + "=" * 60)
    print("✅ Génération terminée!")
    print("\n💡 Ces données sont générées pour illustration.")
    print("   Visitez les sites des torréfacteurs pour des infos réelles.")


if __name__ == '__main__':
    main()
