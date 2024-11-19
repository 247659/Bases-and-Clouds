CREATE OR ALTER TRIGGER trig
ON employees
AFTER UPDATE
AS 
BEGIN
	INSERT INTO job_history(employee_id, start_date, end_date, job_id, department_id)
	SELECT 
		d.employee_id,
		d.hire_date,
		CAST(GETDATE() AS DATE),
		d.job_id,
		d.department_id
	FROM deleted d
	JOIN inserted i on d.employee_id = i.employee_id

	UPDATE employees
	SET hire_date = CAST(DATEADD(DAY, 1, GETDATE()) AS DATE)
	FROM inserted i
	WHERE employees.employee_id = i.employee_id

	DECLARE @new_min_salary NUMERIC(8,2), @new_max_salary NUMERIC(8,2), @current_salary NUMERIC(8,2), @salary_increase NUMERIC(8,2);
	DECLARE @employee_id NUMERIC(6);
	DECLARE @first_name VARCHAR(20), @last_name VARCHAR(20), @job_id VARCHAR(20);
	DECLARE salary_cursor CURSOR FOR
	SELECT i.salary, j.min_salary, j.max_salary, i.employee_id, i.first_name, i.last_name, i.job_id
	FROM inserted i
	JOIN jobs j ON i.job_id = j.job_id

	OPEN salary_cursor
	FETCH NEXT FROM salary_cursor INTO @current_salary, @new_min_salary, @new_max_salary, @employee_id, @first_name, @last_name, @job_id;
	WHILE @@FETCH_STATUS = 0
	BEGIN
		IF @current_salary < @new_min_salary
		BEGIN 
			SET @salary_increase = @new_min_salary - @current_salary
			UPDATE employees
			SET salary = @new_min_salary
			WHERE employee_id = @employee_id
			
			PRINT 'Pracownik ' + @first_name + ' ' + @last_name + ' otrzyma³ oodwy¿kê o ' + CAST(@current_salary AS VARCHAR(10));
		END
		ELSE IF @current_salary > @new_max_salary
		BEGIN 
			UPDATE jobs
			SET max_salary = @current_salary
			WHERE job_id = @job_id
		END
		FETCH NEXT FROM salary_cursor INTO @current_salary, @new_min_salary, @new_max_salary, @employee_id, @first_name, @last_name, @job_id;
	END;
	CLOSE salary_cursor
	DEALLOCATE salary_cursor
END


--dobre wynagrodzenie
INSERT INTO employees (employee_id, first_name, last_name, email, phone_number, hire_date, job_id, salary)
VALUES (1000, 'imie1', 'nazwisko1', 'test1', '515.123.1234', '2000-01-01', 'IT_PROG', 11000);

--wyzsze wynagrodzenie
INSERT INTO employees (employee_id, first_name, last_name, email, phone_number, hire_date, job_id, salary)
VALUES (1001, 'imie2', 'nazwisko2', 'test2', '515.123.1234', '2000-01-01', 'IT_PROG', 25000);

--za niskie wynagrodzenie
INSERT INTO employees (employee_id, first_name, last_name, email, phone_number, hire_date, job_id, salary)
VALUES (1002, 'imie3', 'nazwisko3', 'test3', '515.123.1234', '2000-01-01', 'IT_PROG', 5000);

UPDATE employees SET job_id = 'SA_MAN' WHERE employee_id = 1000;
UPDATE employees SET job_id = 'SA_MAN' WHERE employee_id = 1001;
UPDATE employees SET job_id = 'SA_MAN' WHERE employee_id = 1002;

DELETE FROM job_history WHERE employee_id IN (1000, 1001, 1002);
DELETE FROM employees
WHERE employee_id IN (1000, 1001, 1002);