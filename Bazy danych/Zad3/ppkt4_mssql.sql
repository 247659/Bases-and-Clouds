--zaznaczyc IMPLICIT_TRANSACTIONS w ustawieniach 

--1. W ramach sesji nr 1 rozpocznij transakcj�.
begin transaction;
--2. W ramach sesji nr 1 wy�wietl list� blokad, za kt�re odpowiedzialna jest ta sesja.
select *
from sys.dm_tran_locks
where request_session_id = @@spid
--3. W ramach sesji nr 1 na ca�y czas trwania transakcji za�� blokad� dzielon� na tabeli pracownik�w.
select* from employees WITH (HOLDLOCK, tablock) where employee_id = null;
--4. W ramach sesji nr 1 wy�wietl list� blokad, za kt�re odpowiedzialna jest ta sesja.
select *
from sys.dm_tran_locks
where request_session_id = @@spid

--5. W ramach sesji nr 2 rozpocznij transakcj�.
begin transaction;
--6. W ramach sesji nr 2 wy�wietl wszystkich pracownik�w.
select * from employees;
--7. W ramach sesji nr 2 podwy�sz o 100 z� pensj� wszystkich pracownik�w.
update employees set salary = salary + 100;

--8. W ramach sesji nr 1 zatwierd� transakcj�.
commit transaction;
--9. W ramach sesji nr 1 wy�wietl list� blokad, za kt�re odpowiedzialna jest ta sesja.
select *
from sys.dm_tran_locks
where request_session_id = @@spid

--10. W ramach sesji nr 2 wycofaj transakcj�.
rollback transaction;

--11. W kt�rym momencie uda�o Ci si� podwy�szy� pensj� wszystkich pracownik�w w ramach sesji nr 2?
--Po zatwierdzeniu transakcji w kroku 8.