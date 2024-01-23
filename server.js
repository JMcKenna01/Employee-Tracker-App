const mysql = require('mysql2');
const inquirer = require('inquirer');

// Connect to database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'KingRoad1122$&$', 
    database: 'employee_tracker_db' 
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to the employee_tracker_db database.');
    mainMenu();
});

// Main menu function using inquirer
const menuActions = {
    'View All Departments': viewAllDepartments,
    'View All Roles': viewAllRoles,
    'View All Employees': viewAllEmployees,
    'Add a Department': addDepartment,
    'Add a Role': addRole,
    'Add an Employee': addEmployee,
    'Update Employee Role': updateEmployeeRole,
    'View Employees by Manager': viewEmployeesByManager,
    'View Employees by Department': viewEmployeesByDepartment,
    'Delete Departments, Roles, and Employees': deleteRecords, // Example function
    'Exit': () => db.end()
};

function mainMenu() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: Object.keys(menuActions)
        }
    ]).then((answer) => {
        const action = menuActions[answer.action];
        if (action) {
            action();
        } else {
            console.log('Invalid action!');
        }
    });
}


// function to view all departments
function viewAllDepartments() {
    const query = `SELECT * FROM department`;
    db.query(query, (err, results) => {
        if (err) throw err;
        console.table(results); // Display the query results in a table format
        mainMenu();
    });
}

function updateEmployeeManager() {
    db.query('SELECT * FROM employee', (err, employees) => {
        if (err) throw err;

        inquirer.prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: 'Which employee\'s manager do you want to update?',
                choices: employees.map(employee => ({ name: employee.first_name + ' ' + employee.last_name, value: employee.id }))
            },
            {
                type: 'list',
                name: 'managerId',
                message: 'Who is the new manager?',
                choices: employees.map(employee => ({ name: employee.first_name + ' ' + employee.last_name, value: employee.id }))
            }
        ])
        .then(answers => {
            db.query('UPDATE employee SET manager_id = ? WHERE id = ?', [answers.managerId, answers.employeeId], (err, result) => {
                if (err) throw err;
                console.log('Updated employee\'s manager.');
                mainMenu();
            });
        });
    });
}


function viewEmployeesByManager() {
    // Fetch managers (employees who are managers)
    const managerQuery = `
        SELECT DISTINCT manager.id, CONCAT(manager.first_name, ' ', manager.last_name) AS manager_name
        FROM employee
        INNER JOIN employee AS manager ON employee.manager_id = manager.id`;

    db.query(managerQuery, (err, managers) => {
        if (err) throw err;

        inquirer.prompt([
            {
                type: 'list',
                name: 'managerId',
                message: 'Select a manager to view their employees:',
                choices: managers.map(manager => ({ name: manager.manager_name, value: manager.id }))
            }
        ])
        .then(answer => {
            const employeeQuery = `
                SELECT employee.id, CONCAT(employee.first_name, ' ', employee.last_name) AS employee_name
                FROM employee
                WHERE manager_id = ?`;

            db.query(employeeQuery, answer.managerId, (err, employees) => {
                if (err) throw err;
                console.table(employees);
                mainMenu();
            });
        });
    });
}


function viewEmployeesByDepartment() {
    db.query('SELECT * FROM department', (err, departments) => {
        if (err) throw err;

        inquirer.prompt([
            {
                type: 'list',
                name: 'departmentId',
                message: 'Which department\'s employees do you want to see?',
                choices: departments.map(dept => ({ name: dept.name, value: dept.id }))
            }
        ])
        .then(answer => {
            const query = `SELECT employee.first_name, employee.last_name, department.name AS department 
                           FROM employee 
                           JOIN role ON employee.role_id = role.id 
                           JOIN department ON role.department_id = department.id 
                           WHERE department.id = ?`;
            db.query(query, answer.departmentId, (err, results) => {
                if (err) throw err;
                console.table(results);
                mainMenu();
            });
        });
    });
}


function deleteDepartment() {
    db.query('SELECT * FROM department', (err, departments) => {
        if (err) throw err;

        inquirer.prompt([
            {
                type: 'list',
                name: 'departmentId',
                message: 'Which department would you like to delete?',
                choices: departments.map(dept => ({ name: dept.name, value: dept.id }))
            }
        ])
        .then(answer => {
            db.query('DELETE FROM department WHERE id = ?', answer.departmentId, (err, result) => {
                if (err) throw err;
                console.log('Department deleted.');
                mainMenu();
            });
        });
    });
}


function deleteRole() {
    db.query('SELECT * FROM role', (err, roles) => {
        if (err) throw err;

        inquirer.prompt([
            {
                type: 'list',
                name: 'roleId',
                message: 'Which role would you like to delete?',
                choices: roles.map(role => ({ name: role.title, value: role.id }))
            }
        ])
        .then(answer => {
            db.query('DELETE FROM role WHERE id = ?', answer.roleId, (err, result) => {
                if (err) throw err;
                console.log('Role deleted.');
                mainMenu();
            });
        });
    });
}


function deleteEmployee() {
    db.query('SELECT * FROM employee', (err, employees) => {
        if (err) throw err;

        inquirer.prompt([
            {
                type: 'list',
                name: 'employeeId',
                message: 'Which employee would you like to delete?',
                choices: employees.map(employee => ({ name: employee.first_name + ' ' + employee.last_name, value: employee.id }))
            }
        ])
        .then(answer => {
            db.query('DELETE FROM employee WHERE id = ?', answer.employeeId, (err, result) => {
                if (err) throw err;
                console.log('Employee deleted.');
                mainMenu();
            });
        });
    });
}


function viewDepartmentBudget() {
    db.query('SELECT * FROM department', (err, departments) => {
        if (err) throw err;

        inquirer.prompt([
            {
                type: 'list',
                name: 'departmentId',
                message: 'Which department\'s budget do you want to see?',
                choices: departments.map(dept => ({ name: dept.name, value: dept.id }))
            }
        ])
        .then(answer => {
            const query = `SELECT SUM(role.salary) AS total_budget 
                           FROM employee 
                           JOIN role ON employee.role_id = role.id 
                           WHERE role.department_id = ?`;
            db.query(query, answer.departmentId, (err, results) => {
                if (err) throw err;
                console.log(`Total budget for department: ${results[0].total_budget}`);
                mainMenu();
            });
        });
    });
}

function addDepartment() {
    inquirer.prompt([
        {
            name: 'newDepartment',
            type: 'input',
            message: 'Enter the name of the new department:'
        }
    ]).then(answer => {
        db.query('INSERT INTO department (name) VALUES (?)', [answer.newDepartment], (err, res) => {
            if (err) throw err;
            console.log(`Department ${answer.newDepartment} added successfully.`);
            mainMenu();
        });
    });
}

function addRole() {
    db.query('SELECT * FROM department', (err, departments) => {
        if (err) throw err;

        inquirer.prompt([
            {
                name: 'title',
                type: 'input',
                message: 'Enter the title of the new role:'
            },
            {
                name: 'salary',
                type: 'input',
                message: 'Enter the salary for the new role:',
                validate: value => {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return 'Please enter a valid number for the salary.';
                }
            },
            {
                name: 'department',
                type: 'list',
                choices: departments.map(department => ({ name: department.name, value: department.id })),
                message: 'Select the department for the new role:'
            }
        ])
        .then(answer => {
            db.query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', 
                     [answer.title, parseFloat(answer.salary), answer.department], (err, res) => {
                if (err) throw err;
                console.log(`Role ${answer.title} added successfully.`);
                mainMenu();
            });
        });
    });
}

function addEmployee() {
    db.query('SELECT * FROM role', (err, roles) => {
        if (err) throw err;
        inquirer.prompt([
            {
                name: 'firstName',
                type: 'input',
                message: 'Enter the first name of the employee:'
            },
            {
                name: 'lastName',
                type: 'input',
                message: 'Enter the last name of the employee:'
            },
            {
                name: 'role',
                type: 'list',
                choices: roles.map(role => ({ name: role.title, value: role.id })),
                message: 'Select the role of the employee:'
            },
            {
                name: 'manager',
                type: 'list',
                choices: employees.map(employee => ({ name: employee.first_name + ' ' + employee.last_name, value: employee.id })),
                message: 'Select the manager of the employee (optional):'
            }
        ]).then(answer => {
            // Capture manager ID (null if not selected)
            const managerId = answer.manager === 'None' ? null : answer.manager;

            // Insert new employee into the database with manager ID
            db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', 
                     [answer.firstName, answer.lastName, answer.role, managerId], (err, res) => {
                if (err) throw err;
                console.log(`Employee ${answer.firstName} ${answer.lastName} added successfully.`);
                mainMenu();
            });
        });
    });
}

function updateEmployeeRole() {
    db.query('SELECT * FROM employee', (err, employees) => {
        if (err) throw err;
        db.query('SELECT * FROM role', (err, roles) => {
            if (err) throw err;
            inquirer.prompt([
                {
                    name: 'employee',
                    type: 'list',
                    choices: employees.map(employee => ({ name: employee.first_name + ' ' + employee.last_name, value: employee.id })),
                    message: 'Select the employee whose role you want to update:'
                },
                {
                    name: 'role',
                    type: 'list',
                    choices: roles.map(role => ({ name: role.title, value: role.id })),
                    message: 'Select the new role for the employee:'
                }
            ]).then(answer => {
                db.query('UPDATE employee SET role_id = ? WHERE id = ?', 
                         [answer.role, answer.employee], (err, res) => {
                    if (err) throw err;
                    console.log(`Employee role updated successfully.`);
                    mainMenu();
                });
            });
        });
    });
}

function viewAllRoles() {
    const query = `SELECT role.id, role.title, department.name AS department, role.salary 
                   FROM role 
                   INNER JOIN department ON role.department_id = department.id`;
    db.query(query, (err, results) => {
        if (err) throw err;
        console.table(results); // Display the query results in a table format
        mainMenu();
    });
}

function viewAllEmployees() {
    const query = `
        SELECT 
            employee.id, 
            employee.first_name, 
            employee.last_name, 
            role.title, 
            department.name AS department, 
            role.salary, 
            CONCAT(manager.first_name, ' ', manager.last_name) AS manager 
        FROM employee 
        LEFT JOIN role ON employee.role_id = role.id 
        LEFT JOIN department ON role.department_id = department.id
        LEFT JOIN employee AS manager ON employee.manager_id = manager.id`;

    db.query(query, (err, results) => {
        if (err) throw err;
        console.table(results); // Display the results in a table format
        mainMenu();
    });
}

function deleteRecords() {
    inquirer.prompt({
        type: 'list',
        name: 'recordType',
        message: 'What type of record would you like to delete?',
        choices: ['Department', 'Role', 'Employee']
    }).then(answer => {
        const deleteActions = {
            'Department': deleteDepartment,
            'Role': deleteRole,
            'Employee': deleteEmployee
        };

        const action = deleteActions[answer.recordType];
        if (action) {
            action();
        } else {
            console.log('Invalid choice!');
            mainMenu();
        }
    });
}

