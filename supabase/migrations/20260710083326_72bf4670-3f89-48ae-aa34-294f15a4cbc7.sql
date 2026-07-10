UPDATE public.settings
SET value = jsonb_set(
  jsonb_set(
    jsonb_set(
      COALESCE(value, '{}'::jsonb),
      '{image_url}', '"/__l5e/assets-v1/6a6857c5-d003-407c-b4ff-7677ebd997b7/shanti-storefront.jpg"'
    ),
    '{title}', '"Premium Shawls, Stoles, Suits & Traditional Himachali Collection"'
  ),
  '{subtitle}', '"Hand-picked woollen heritage from the heart of Kangra Valley — trusted by families across India for generations."'
)
WHERE key = 'hero';