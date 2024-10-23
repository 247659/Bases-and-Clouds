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

