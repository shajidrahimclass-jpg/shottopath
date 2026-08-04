
-- 카테고리 slug 자동 생성 함수
CREATE OR REPLACE FUNCTION generate_category_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter   INT := 0;
BEGIN
  -- name을 소문자, 공백→하이픈, 영숫자·하이픈만 남기기
  base_slug := lower(regexp_replace(trim(NEW.name), '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);

  -- 비어있으면 uuid fallback
  IF base_slug = '' THEN
    base_slug := 'category-' || gen_random_uuid()::text;
  END IF;

  final_slug := base_slug;

  -- 중복 방지: 같은 slug가 이미 있으면 숫자 붙이기
  LOOP
    IF counter = 0 THEN
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM categories WHERE slug = final_slug AND id != NEW.id
      );
    ELSE
      final_slug := base_slug || '-' || counter;
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM categories WHERE slug = final_slug AND id != NEW.id
      );
    END IF;
    counter := counter + 1;
  END LOOP;

  NEW.slug := final_slug;
  RETURN NEW;
END;
$$;

-- INSERT 시 slug가 비어있으면 자동 생성
CREATE OR REPLACE TRIGGER trg_category_slug_insert
  BEFORE INSERT ON categories
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION generate_category_slug();

-- UPDATE 시 name이 바뀌면 slug도 재생성
CREATE OR REPLACE TRIGGER trg_category_slug_update
  BEFORE UPDATE ON categories
  FOR EACH ROW
  WHEN (NEW.name IS DISTINCT FROM OLD.name AND (NEW.slug = OLD.slug OR NEW.slug IS NULL OR NEW.slug = ''))
  EXECUTE FUNCTION generate_category_slug();
