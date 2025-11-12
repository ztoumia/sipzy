#!/usr/bin/env python3
"""
Script pour scraper les sites web des torréfacteurs français
et extraire les informations sur leurs cafés.
"""

import csv
import re
import time
import json
from typing import List, Dict, Optional
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup

# Configuration
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Cache-Control': 'max-age=0',
}
TIMEOUT = 15
DELAY_BETWEEN_REQUESTS = 3  # secondes

# Mots-clés pour identifier les pages de produits/cafés
COFFEE_KEYWORDS = [
    'cafe', 'coffee', 'produit', 'product', 'shop', 'boutique',
    'notre-selection', 'nos-cafes', 'collections'
]

# Mots-clés pour identifier les origines
ORIGINS_KEYWORDS = [
    'ethiopia', 'ethiopie', 'kenya', 'colombia', 'colombie', 'brazil', 'bresil',
    'guatemala', 'costa rica', 'rwanda', 'burundi', 'peru', 'perou',
    'honduras', 'el salvador', 'tanzania', 'tanzanie', 'indonesia', 'indonesie',
    'yemen', 'india', 'inde', 'mexico', 'mexique', 'nicaragua', 'panama'
]

# Mots-clés pour identifier les processus
PROCESS_KEYWORDS = [
    'washed', 'lave', 'lavé', 'natural', 'nature', 'naturel',
    'honey', 'miel', 'semi-washed', 'pulped natural', 'anaerobic', 'anaerobie'
]


class CoffeeScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.coffees_data = []

    def scrape_roasters(self, csv_file: str):
        """Lit le fichier CSV des torréfacteurs et scrape chaque site."""
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            roasters = list(reader)

        print(f"🔍 Trouvé {len(roasters)} torréfacteurs à scraper\n")

        for i, roaster in enumerate(roasters, 1):
            print(f"[{i}/{len(roasters)}] Scraping {roaster['name']}...")
            try:
                coffees = self.scrape_roaster_website(
                    roaster['name'],
                    roaster['website']
                )
                print(f"  ✓ Trouvé {len(coffees)} café(s)\n")
                self.coffees_data.extend(coffees)
            except Exception as e:
                print(f"  ✗ Erreur: {str(e)}\n")

            # Délai entre les requêtes
            if i < len(roasters):
                time.sleep(DELAY_BETWEEN_REQUESTS)

    def scrape_roaster_website(self, roaster_name: str, website: str) -> List[Dict]:
        """Scrape le site web d'un torréfacteur pour trouver les cafés."""
        coffees = []

        # Essayer de trouver la page boutique/produits
        shop_urls = self.find_shop_pages(website)

        if not shop_urls:
            # Si pas de page boutique trouvée, essayer la page d'accueil
            shop_urls = [website]

        for url in shop_urls[:3]:  # Limiter à 3 URLs max par roaster
            try:
                page_coffees = self.extract_coffees_from_page(roaster_name, url)
                coffees.extend(page_coffees)
                time.sleep(1)
            except Exception as e:
                print(f"    Erreur sur {url}: {str(e)}")

        return coffees

    def find_shop_pages(self, website: str) -> List[str]:
        """Trouve les URLs des pages boutique/produits."""
        try:
            response = self.session.get(website, timeout=TIMEOUT)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')

            # Chercher les liens qui contiennent des mots-clés de café
            shop_urls = []
            for link in soup.find_all('a', href=True):
                href = link['href'].lower()
                if any(keyword in href for keyword in COFFEE_KEYWORDS):
                    full_url = urljoin(website, link['href'])
                    if full_url not in shop_urls:
                        shop_urls.append(full_url)

            return shop_urls[:5]  # Limiter à 5 URLs
        except Exception as e:
            print(f"    Erreur lors de la recherche des pages boutique: {str(e)}")
            return []

    def extract_coffees_from_page(self, roaster_name: str, url: str) -> List[Dict]:
        """Extrait les informations sur les cafés d'une page."""
        try:
            response = self.session.get(url, timeout=TIMEOUT)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')

            coffees = []

            # Stratégie 1: Chercher des produits structurés
            products = self.find_product_elements(soup)

            for product in products[:10]:  # Limiter à 10 produits par page
                coffee_data = self.extract_coffee_info(roaster_name, product, url)
                if coffee_data and self.is_valid_coffee(coffee_data):
                    coffees.append(coffee_data)

            return coffees
        except Exception as e:
            raise Exception(f"Erreur d'extraction: {str(e)}")

    def find_product_elements(self, soup: BeautifulSoup) -> List:
        """Trouve les éléments HTML qui représentent des produits."""
        products = []

        # Patterns communs pour les produits
        selectors = [
            {'class': re.compile(r'product', re.I)},
            {'class': re.compile(r'item', re.I)},
            {'class': re.compile(r'card', re.I)},
            {'class': re.compile(r'coffee', re.I)},
            {'itemtype': re.compile(r'Product', re.I)},
        ]

        for selector in selectors:
            found = soup.find_all(['div', 'article', 'li'], selector, limit=20)
            if found:
                products.extend(found)

        # Dédupliquer
        return list(set(products))

    def extract_coffee_info(self, roaster_name: str, element, page_url: str) -> Optional[Dict]:
        """Extrait les informations d'un élément produit."""
        try:
            # Extraire le nom
            name = self.extract_name(element)
            if not name:
                return None

            # Extraire la description
            description = self.extract_description(element)

            # Extraire l'origine
            origin = self.extract_origin(element.get_text())

            # Extraire le processus
            process = self.extract_process(element.get_text())

            # Extraire le prix
            price_range = self.extract_price(element.get_text())

            # Extraire l'image
            image_url = self.extract_image(element, page_url)

            # Extraire les notes
            notes = self.extract_notes(element.get_text())

            return {
                'name': name,
                'roaster_name': roaster_name,
                'origin': origin,
                'process': process,
                'variety': '',  # Difficile à extraire automatiquement
                'altitude_min': '',
                'altitude_max': '',
                'harvest_year': '',
                'price_range': price_range,
                'description': description,
                'image_url': image_url,
                'notes': notes
            }
        except Exception as e:
            return None

    def extract_name(self, element) -> Optional[str]:
        """Extrait le nom du café."""
        # Chercher dans les titres
        for tag in ['h1', 'h2', 'h3', 'h4']:
            title = element.find(tag)
            if title:
                name = title.get_text(strip=True)
                if len(name) > 3 and len(name) < 200:
                    return name

        # Chercher dans les liens
        link = element.find('a')
        if link:
            name = link.get_text(strip=True)
            if len(name) > 3 and len(name) < 200:
                return name

        return None

    def extract_description(self, element) -> str:
        """Extrait la description."""
        # Chercher les paragraphes
        paragraphs = element.find_all('p')
        for p in paragraphs:
            text = p.get_text(strip=True)
            if len(text) > 50:
                return text[:500]  # Limiter à 500 caractères

        return ''

    def extract_origin(self, text: str) -> str:
        """Extrait l'origine du café depuis le texte."""
        text_lower = text.lower()
        for origin in ORIGINS_KEYWORDS:
            if origin in text_lower:
                return origin.title()
        return ''

    def extract_process(self, text: str) -> str:
        """Extrait le processus depuis le texte."""
        text_lower = text.lower()
        for process in PROCESS_KEYWORDS:
            if process in text_lower:
                if 'natural' in process or 'nature' in process:
                    return 'Natural'
                elif 'washed' in process or 'lavé' in process or 'lave' in process:
                    return 'Washed'
                elif 'honey' in process or 'miel' in process:
                    return 'Honey'
        return ''

    def extract_price(self, text: str) -> str:
        """Extrait et convertit le prix en gamme."""
        # Chercher les prix en euros
        prices = re.findall(r'(\d+[,.]?\d*)\s*€', text)
        if prices:
            try:
                price = float(prices[0].replace(',', '.'))
                if price < 10:
                    return '$'
                elif price < 20:
                    return '$$'
                elif price < 30:
                    return '$$$'
                else:
                    return '$$$$'
            except:
                pass
        return '$$'  # Prix par défaut

    def extract_image(self, element, page_url: str) -> str:
        """Extrait l'URL de l'image."""
        img = element.find('img')
        if img:
            src = img.get('src') or img.get('data-src')
            if src:
                return urljoin(page_url, src)
        return ''

    def extract_notes(self, text: str) -> str:
        """Essaie d'extraire les notes de dégustation."""
        # Liste des notes communes
        notes_list = [
            'Citrus', 'Berry', 'Stone Fruit', 'Tropical Fruit', 'Apple',
            'Floral', 'Jasmine', 'Rose',
            'Chocolate', 'Dark Chocolate', 'Cocoa', 'Milk Chocolate',
            'Nutty', 'Almond', 'Hazelnut',
            'Caramel', 'Honey', 'Brown Sugar', 'Vanilla',
            'Earthy', 'Woody', 'Spicy', 'Cinnamon'
        ]

        found_notes = []
        text_lower = text.lower()

        for note in notes_list:
            if note.lower() in text_lower:
                found_notes.append(note)

        return ';'.join(found_notes[:5])  # Max 5 notes

    def is_valid_coffee(self, coffee_data: Dict) -> bool:
        """Vérifie si les données du café sont valides."""
        return (
            coffee_data.get('name') and
            len(coffee_data['name']) > 3 and
            'cookie' not in coffee_data['name'].lower() and
            'politique' not in coffee_data['name'].lower()
        )

    def save_to_csv(self, output_file: str):
        """Sauvegarde les données dans un fichier CSV."""
        if not self.coffees_data:
            print("❌ Aucune donnée à sauvegarder")
            return

        fieldnames = [
            'name', 'roaster_name', 'origin', 'process', 'variety',
            'altitude_min', 'altitude_max', 'harvest_year', 'price_range',
            'description', 'image_url', 'notes'
        ]

        with open(output_file, 'w', encoding='utf-8', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(self.coffees_data)

        print(f"\n✅ {len(self.coffees_data)} cafés sauvegardés dans {output_file}")


def main():
    print("☕ Scraper de torréfacteurs français\n")
    print("=" * 50)

    scraper = CoffeeScraper()

    # Scraper les sites
    scraper.scrape_roasters('torrefacteurs-france.csv')

    # Sauvegarder les résultats
    scraper.save_to_csv('coffees-scraped.csv')

    print("\n" + "=" * 50)
    print("✅ Scraping terminé!")


if __name__ == '__main__':
    main()
