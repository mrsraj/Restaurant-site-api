# Home content
GET /api/v1/home uses X-Restaurant-Id (default 1) and returns that restaurant's home content and up to 12 active menu items. No authentication is required for published content. Dishes are recent menu items, not a calculated popularity ranking.

Apply migration 20260917000000_restaurant_home.js on existing databases. Fresh schema.sql includes restaurant_home. There are no foreign keys. restaurant_id uniquely identifies the content record and must match an existing restaurant.

Populate hero_title, hero_image_url, description, opening_hours and sections. sections is a JSON array of objects with title and description strings, for example [{"title":"Facilities","description":"Outdoor seating and parking"}]. Use sections for features, facilities, work culture and reasons to choose the restaurant. The page omits unconfigured sections. Content is edited in the database for now; no admin editor has been added.

