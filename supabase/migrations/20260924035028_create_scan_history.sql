/*
# Create scan_history table (single-tenant, no auth)

1. New Tables
- `scan_history`
  - `id` (uuid, primary key)
  - `image_url` (text, the object URL or data URL of the scanned face image — note: these are ephemeral blob URLs, stored for reference)
  - `overall_score` (int, the golden ratio overall score 0-100)
  - `skin_score` (int, the skin analysis overall score 0-100)
  - `face_shape` (text, one of: oval, round, square, heart, long, diamond)
  - `face_shape_label` (text, Chinese label for the face shape)
  - `summary` (text, a short human-readable summary of the scan result)
  - `created_at` (timestamptz, defaults to now())
2. Security
- Enable RLS on `scan_history`.
- Allow anon + authenticated CRUD because this is a single-tenant app with no sign-in screen.
- All 4 policies use `USING (true)` / `WITH CHECK (true)` because the data is intentionally shared/public.
*/

CREATE TABLE IF NOT EXISTS scan_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text,
  overall_score int DEFAULT 0,
  skin_score int DEFAULT 0,
  face_shape text DEFAULT 'oval',
  face_shape_label text DEFAULT '',
  summary text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_scan_history" ON scan_history;
CREATE POLICY "anon_select_scan_history" ON scan_history FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_scan_history" ON scan_history;
CREATE POLICY "anon_insert_scan_history" ON scan_history FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_scan_history" ON scan_history;
CREATE POLICY "anon_update_scan_history" ON scan_history FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_scan_history" ON scan_history;
CREATE POLICY "anon_delete_scan_history" ON scan_history FOR DELETE
  TO anon, authenticated USING (true);
