create sequence visitor_id_seq
start with 100  
increment by 10; 

create table visitors (
    visitor_id INT default nextval('visitor_id_seq') primary key,
    employee_id INT not null,
    company VARCHAR(255),
    people_number INT,
    parking BOOLEAN, 
    enter_datetime TIMESTAMP,
    exit_datetime TIMESTAMP,
    foreign key (employee_id) references employees(employee_id),
    check (exit_datetime > enter_datetime and exit_datetime <= CURRENT_TIMESTAMP)
);

-- SELECT employee_id FROM employees d WHERE d.first_name = 'Daniel' and d.last_name = 'Faviet';

INSERT INTO visitors (employee_id, company, people_number, parking, enter_datetime, exit_datetime)
VALUES (109, 'RSM', 1, TRUE, '2024-10-13 09:00:00', '2024-10-13 10:00:00');

INSERT INTO visitors (employee_id, company, people_number, parking, enter_datetime, exit_datetime)
VALUES (109, 'KPMG', 3, FALSE, '2024-10-14 10:00:00', '2024-10-14 11:30:00');

ALTER TABLE visitors
DROP COLUMN parking;

-- SELECT * FROM visitors

-- SELECT employee_id FROM employees d WHERE d.first_name = 'John' and d.last_name = 'Chen';

UPDATE visitors
SET employee_id = 110
WHERE company = 'KPMG';

DELETE FROM visitors
WHERE employee_id = 109;

DROP TABLE visitors;


