-- CreateTable: inventory_categories
CREATE TABLE "inventory"."inventory_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable: inventory_subcategories
CREATE TABLE "inventory"."inventory_subcategories" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_subcategories_pkey" PRIMARY KEY ("id")
);

-- Insert categories (fixed UUID for "Otro" so we can backfill items)
INSERT INTO "inventory"."inventory_categories" ("id", "name", "sort_order") VALUES
  (gen_random_uuid(), 'Materiales de Obra Gris (Estructurales)', 0),
  (gen_random_uuid(), 'Acabados y Revestimientos', 1),
  (gen_random_uuid(), 'Instalaciones Hidrosanitarias y Gas', 2),
  (gen_random_uuid(), 'Instalaciones Eléctricas e Iluminación', 3),
  (gen_random_uuid(), 'Herramientas y Equipo Menor', 4),
  (gen_random_uuid(), 'Equipo de Protección Personal (EPP)', 5),
  (gen_random_uuid(), 'Maquinaria y Equipo Mayor (Activos)', 6),
  ('00000000-0000-0000-0000-000000000001', 'Otro / Sin clasificar', 7);

-- Insert subcategories (category_id from inventory_categories by name order)
INSERT INTO "inventory"."inventory_subcategories" ("id", "category_id", "name", "sort_order")
SELECT gen_random_uuid(), c.id, sub.name, sub.ord
FROM (VALUES
  ('Materiales de Obra Gris (Estructurales)', 'Agregados', 0),
  ('Materiales de Obra Gris (Estructurales)', 'Conglomerantes', 1),
  ('Materiales de Obra Gris (Estructurales)', 'Aceros', 2),
  ('Materiales de Obra Gris (Estructurales)', 'Ladrillería', 3),
  ('Acabados y Revestimientos', 'Pisos y Paredes', 0),
  ('Acabados y Revestimientos', 'Pinturas y Químicos', 1),
  ('Acabados y Revestimientos', 'Cielos y Paneles', 2),
  ('Instalaciones Hidrosanitarias y Gas', 'Tuberías', 0),
  ('Instalaciones Hidrosanitarias y Gas', 'Accesorios', 1),
  ('Instalaciones Hidrosanitarias y Gas', 'Aparatos', 2),
  ('Instalaciones Eléctricas e Iluminación', 'Conducción', 0),
  ('Instalaciones Eléctricas e Iluminación', 'Cableado', 1),
  ('Instalaciones Eléctricas e Iluminación', 'Dispositivos', 2),
  ('Instalaciones Eléctricas e Iluminación', 'Luminarias', 3),
  ('Herramientas y Equipo Menor', 'Herramienta Manual', 0),
  ('Herramientas y Equipo Menor', 'Herramienta Eléctrica', 1),
  ('Herramientas y Equipo Menor', 'Consumibles', 2),
  ('Equipo de Protección Personal (EPP)', 'Protección Corporal', 0),
  ('Equipo de Protección Personal (EPP)', 'Protección Facial/Auditiva', 1),
  ('Equipo de Protección Personal (EPP)', 'Alturas', 2),
  ('Maquinaria y Equipo Mayor (Activos)', 'Equipo Propio', 0),
  ('Maquinaria y Equipo Mayor (Activos)', 'Maquinaria Amarilla', 1),
  ('Otro / Sin clasificar', 'General', 0)
) AS sub(cat_name, name, ord)
JOIN "inventory"."inventory_categories" c ON c.name = sub.cat_name;

-- Add category_id and subcategory_id to inventory_items
ALTER TABLE "inventory"."inventory_items" ADD COLUMN "category_id" TEXT,
ADD COLUMN "subcategory_id" TEXT;

-- Backfill: set category_id to "Otro / Sin clasificar" for all existing items
UPDATE "inventory"."inventory_items" SET "category_id" = '00000000-0000-0000-0000-000000000001' WHERE "category_id" IS NULL;

-- Drop legacy category column and make category_id required
ALTER TABLE "inventory"."inventory_items" DROP COLUMN IF EXISTS "category";
ALTER TABLE "inventory"."inventory_items" ALTER COLUMN "category_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "inventory_items_category_id_idx" ON "inventory"."inventory_items"("category_id");

-- AddForeignKey
ALTER TABLE "inventory"."inventory_subcategories" ADD CONSTRAINT "inventory_subcategories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "inventory"."inventory_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inventory"."inventory_items" ADD CONSTRAINT "inventory_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "inventory"."inventory_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inventory"."inventory_items" ADD CONSTRAINT "inventory_items_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "inventory"."inventory_subcategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
