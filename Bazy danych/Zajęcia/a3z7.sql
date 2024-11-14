--------MS SQL Server-------------

DECLARE @country_name NVARCHAR(100);
SET @country_name = 'United States of America';

-- Deklaracja kursora
DECLARE  location_cursor CURSOR FOR
SELECT location_id, city
FROM locations
JOIN countries on countries.country_id = locations.country_id
WHERE country_name = @country_name;

-- Zmienne do przechowywania wynik�w kursora
DECLARE @location_id INT;
DECLARE @city NVARCHAR(255);

BEGIN
-- Otwarcie kursora
OPEN location_cursor;

-- Pobieranie danych z kursora i wy�wietlanie wynik�w
FETCH NEXT FROM location_cursor INTO @location_id, @city;

WHILE @@FETCH_STATUS = 0
BEGIN
    PRINT 'Location ID: ' + CAST(@location_id AS NVARCHAR) + ', City: ' + @city;
    FETCH NEXT FROM location_cursor INTO @location_id, @city;
END;

-- Zamkni�cie kursora i zwolnienie zasob�w
CLOSE location_cursor;
DEALLOCATE location_cursor;

END;

--------PostgreSQL-------------

DO $$
DECLARE
    location_id INT;
    city VARCHAR(255);
    location_cursor CURSOR (country VARCHAR(100)) FOR 
        SELECT l.location_id, l.city
        FROM locations l
        JOIN countries c ON c.country_id = l.country_id
        WHERE c.country_name = country;
BEGIN
    -- Otwarcie kursora
    OPEN location_cursor('United States of America');
    
    -- Pobieranie danych z kursora i wy�wietlanie wynik�w
    LOOP
        FETCH location_cursor INTO location_id, city;
        EXIT WHEN NOT FOUND;
        
        -- Wy�wietlanie wynik�w
        RAISE NOTICE 'Location ID: %, City: %', location_id, city;
    END LOOP;
    
    -- Zamkni�cie kursora
    CLOSE location_cursor;
END $$;

