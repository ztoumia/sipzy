-- V4: Seed Tasting Notes Data

INSERT INTO notes (name, category) VALUES
    -- Fruity notes
    ('Citrus', 'Fruity'),
    ('Berry', 'Fruity'),
    ('Stone Fruit', 'Fruity'),
    ('Tropical Fruit', 'Fruity'),
    ('Apple', 'Fruity'),
    ('Grape', 'Fruity'),

    -- Floral notes
    ('Floral', 'Floral'),
    ('Jasmine', 'Floral'),
    ('Rose', 'Floral'),
    ('Lavender', 'Floral'),
    ('Chamomile', 'Floral'),

    -- Chocolatey notes
    ('Chocolate', 'Chocolatey'),
    ('Dark Chocolate', 'Chocolatey'),
    ('Cocoa', 'Chocolatey'),
    ('Milk Chocolate', 'Chocolatey'),

    -- Nutty notes
    ('Nutty', 'Nutty'),
    ('Almond', 'Nutty'),
    ('Hazelnut', 'Nutty'),
    ('Peanut', 'Nutty'),

    -- Sweet notes
    ('Caramel', 'Sweet'),
    ('Honey', 'Sweet'),
    ('Brown Sugar', 'Sweet'),
    ('Maple Syrup', 'Sweet'),
    ('Vanilla', 'Sweet'),

    -- Earthy notes
    ('Earthy', 'Earthy'),
    ('Woody', 'Earthy'),
    ('Tobacco', 'Earthy'),

    -- Spicy notes
    ('Spicy', 'Spicy'),
    ('Cinnamon', 'Spicy'),
    ('Pepper', 'Spicy')
ON CONFLICT (name) DO NOTHING;
