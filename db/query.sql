-- Query to get all departments
SELECT * FROM department;

-- Query to get all roles
SELECT * FROM role;

-- Query to get all employees
SELECT * FROM employee;

-- Add a new department
INSERT INTO department (name) VALUES ('New Department');

-- Add a new role
INSERT INTO role (title, salary, department_id) VALUES ('New Role', 50000, 1);

-- Add a new employee
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('John', 'Doe', 1, NULL);

-- Update an employee's role
UPDATE employee SET role_id = 2 WHERE id = 1;

-- Update an employee's manager
UPDATE employee SET manager_id = 2 WHERE id = 1;

-- Query to view employees by a specific manager
SELECT * FROM employee WHERE manager_id = 1;

-- Query to view employees by department
SELECT employee.*, department.name AS department_name
FROM employee
JOIN role ON employee.role_id = role.id
JOIN department ON role.department_id = department.id
WHERE department.id = 1;

-- Delete a department
DELETE FROM department WHERE id = 3;

-- Delete a role
DELETE FROM role WHERE id = 4;

-- Delete an employee
DELETE FROM employee WHERE id = 5;

-- Calculate the total budget of a department
SELECT department.id, department.name, SUM(role.salary) AS total_budget
FROM department
JOIN role ON department.id = role.department_id
JOIN employee ON role.id = employee.role_id
GROUP BY department.id, department.name;
