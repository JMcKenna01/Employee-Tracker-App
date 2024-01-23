-- Seed data for `department` table
INSERT INTO department (name) VALUES 
('Engineering'),
('Human Resources'),
('Marketing');

-- Seed data for `role` table
INSERT INTO role (title, salary, department_id) VALUES 
('Software Engineer', 70000, 1),
('HR Manager', 60000, 2),
('Marketing Specialist', 55000, 3);

-- Seed data for `employee` table
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES 
('Emily', 'Johnson', 3, NULL),  -- Assuming Emily is a manager or has no manager
('Jane', 'Smith', 2, NULL);      -- Assuming Jane is a manager or has no manager

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES 
('John', 'Doe', 1, 1);           -- John's manager is Emily (with id 1)
