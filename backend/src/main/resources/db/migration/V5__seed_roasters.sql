-- V5: Seed Demo Roasters Data

INSERT INTO roasters (name, description, location, website) VALUES
    ('La Cabra', 'Award-winning Nordic roaster known for light roasts and transparency', 'Aarhus, Denmark', 'https://lacabra.dk'),
    ('The Barn', 'Berlin-based specialty roaster focusing on quality and sustainability', 'Berlin, Germany', 'https://thebarn.de'),
    ('Square Mile Coffee', 'London roaster co-founded by World Barista Champions', 'London, UK', 'https://squaremilecoffee.com'),
    ('Onyx Coffee Lab', 'American roaster specializing in experimental processing', 'Arkansas, USA', 'https://onyxcoffeelab.com'),
    ('Tim Wendelboe', 'Norwegian roaster and world barista champion', 'Oslo, Norway', 'https://timwendelboe.no'),
    ('April Coffee', 'Copenhagen-based roaster with focus on Scandinavian roast style', 'Copenhagen, Denmark', 'https://aprilcoffee.dk'),
    ('Gardelli Specialty Coffees', 'Italian roaster winning multiple championships', 'Forli, Italy', 'https://gardellicoffee.com'),
    ('Manhattan Coffee Roasters', 'Rotterdam roaster committed to direct trade', 'Rotterdam, Netherlands', 'https://manhattancoffeeroasters.com'),
    ('Nomad Coffee', 'Barcelona-based specialty roaster', 'Barcelona, Spain', 'https://nomadcoffee.es'),
    ('Belleville Brûlerie', 'Parisian roaster promoting specialty coffee in France', 'Paris, France', 'https://bellevillebrulerie.com')
ON CONFLICT (name) DO NOTHING;
