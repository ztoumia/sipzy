# Scraper de Torréfacteurs Français

Ce script Python permet de scraper automatiquement les sites web des torréfacteurs français pour extraire les informations sur leurs cafés.

## 🚀 Installation

1. Installer les dépendances Python :
```bash
pip install -r requirements.txt
```

## 📋 Utilisation

1. Assurez-vous que le fichier `torrefacteurs-france.csv` est dans le même dossier

2. Exécuter le script :
```bash
python scrape_roasters.py
```

3. Le script va :
   - Lire tous les torréfacteurs du CSV
   - Visiter chaque site web
   - Chercher les pages de produits/cafés
   - Extraire automatiquement les informations
   - Générer un fichier `coffees-scraped.csv` avec les résultats

## 📊 Données extraites

Le script essaie d'extraire automatiquement :
- **Nom du café**
- **Origine** (pays)
- **Processus** (Washed, Natural, Honey, etc.)
- **Gamme de prix** ($, $$, $$$, $$$$)
- **Description**
- **URL de l'image**
- **Notes de dégustation** (Citrus, Chocolate, etc.)

## ⚙️ Configuration

Vous pouvez modifier les paramètres dans le script :
- `DELAY_BETWEEN_REQUESTS` : Délai entre chaque requête (défaut: 2 secondes)
- `TIMEOUT` : Timeout des requêtes HTTP (défaut: 10 secondes)
- Mots-clés pour la détection d'origines, processus, notes

## ⚠️ Limitations

- Le scraping web est fragile : chaque site a sa propre structure
- Certaines informations peuvent ne pas être extraites correctement
- Le script respecte un délai entre les requêtes pour ne pas surcharger les serveurs
- Les sites avec JavaScript dynamique ne sont pas supportés (nécessiterait Selenium)
- Vérifiez toujours les données extraites avant de les importer

## 🔧 Améliorations possibles

- Ajouter le support de Selenium pour les sites JavaScript
- Créer des extracteurs spécifiques par torréfacteur
- Améliorer la détection des variétés et altitudes
- Ajouter un système de cache pour éviter de re-scraper
- Implémenter la détection de l'année de récolte

## 📝 Notes

- Le script est conçu pour être respectueux des sites web
- Un User-Agent navigateur est utilisé
- Des délais sont respectés entre les requêtes
- Consultez les CGU des sites avant de scraper massivement
