SELECT d.department_name
FROM departments d
LEFT JOIN employees e ON d.department_id = e.department_id
WHERE e.employee_id IS NULL
GROUP BY D.department_name, D.department_id;


SELECT 
    m.first_name AS manager_first_name,
    m.last_name AS manager_last_name,
    m.salary - COALESCE(avg_emp_salary.avg_salary, 0) AS salary_difference
FROM 
    employees m
LEFT JOIN (
    SELECT 
        manager_id,
        AVG(salary) AS avg_salary
    FROM 
        employees
    GROUP BY 
        manager_id
) avg_emp_salary ON m.employee_id = avg_emp_salary.manager_id
WHERE 
    m.manager_id IS NULL;  -- Jeśli chcesz tylko menedżerów, którzy nie mają przełożonego

SELECT 
    l.city,
    CONCAT(
        LPAD(l.postal_code, 5, '0'), '_', 
        l.country_id, 
        UPPER(RIGHT(l.city, 3))
    ) AS code
FROM 
    locations l
WHERE 
    l.postal_code ~ '^[0-9]{5}$';  -- Filtruj tylko pięciocyfrowe kody pocztowe



