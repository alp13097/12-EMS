var express = require("express");
const mysql = require("mysql");
const inquirer = require("inquirer");
const util = require("util");
require("console.table");

// var app = express();

// var PORT = process.env.PORT || 8080

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Fairview13097",
    database: "employees"
});

connection.connect(function(err) {
    if(err) {
        console.error("error connecting: " + err.stack);
        return;
    }
    console.log("connected as id " + connection.threadId);
    promptUser();
});

connection.query = util.promisify(connection.query);



function promptUser() {
    inquirer
        .prompt({
            message: "What action would you like to take?",
            type: "list",
            name: "action",
            choices: [
                "View All Employees",
                "View Employees by Department",
                "View All Roles",
                "Add New Employee",
                "Add New Department",
                "Add New Role",
                "Update Employee Role",
                "Remove Employee"
            ]
        }).then(function (answer) {
            switch (answer.action) {
// Code ran when user chooses first option                
                case "View All Employees":
                    connection.query("SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager From employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;",
                    function (err, res) {
                        if (err) throw err;
                        console.table(res);
                        promptUser();
                    });
                    break;

// Code ran when user chooses second option                
                case "View Employees by Department":
                    connection.query("SELECT employee.id, employee.first_name, employee.last_name, department.name FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id WHERE department.id;",
                    function (err, res) {
                        if (err) throw err;
                        console.table(res);
                        promptUser();
                    });
                    break;

// Code ran when user chooses third option
                case "View All Roles":
                    connection.query("SELECT * FROM role", function (err, res) {
                        if (err) throw err;
                        console.table(res);
                        promptUser();
                    });
                    break;

// Code ran when user chooses fourth option
                case "Add New Employee":
                    connection.query("SELECT * FROM department", function (err, res) {
                        if (err) throw err;
                        console.table(res);

                        connection.query("SELECT * FROM role", function (err, res) {
                            if (err) throw err;
                            console.table(res);

                            connection.query("SELECT * FROM employee", function (err, res) {
                                if (err) throw err;
                                console.table(res);

                                inquirer
                                    .prompt([
                                        {
                                            message: "Employees first name?",
                                            type: "input",
                                            name: "firstName",
                                            validate: answer => {
                                                if (answer !== "") {
                                                    return true;
                                                }
                                                return "I'm sorry, please try again.";
                                            }
                                        },
                                        {
                                            message: "Employees last name?",
                                            type: "input",
                                            name: "lastName",
                                            validate: answer => {
                                                if (answer !== "") {
                                                    return true;
                                                }
                                                return "I'm sorry, please try again.";
                                            }
                                        },
                                        {
                                            message: "Please enter role id.",
                                            type: "input",
                                            name: "role"
                                        },
                                        {
                                            message: "Please enter employee manager id if applicable.",
                                            type: "input",
                                            name: "manager",
                                        }
                                    ]).then(function (answer) {
                                            connection.query(
                                            "INSERT INTO employee SET first_name = ?, last_name = ?, role_id = ?, manager_id = ?",
                                            [answer.firstName, answer.lastName, answer.role, answer.manager],
                                            function (err) {
                                                if (err) throw err;
                                                promptUser();
                                            }
                                        )
                                    });
                            });
                        });
                    });
                    break;

// Code ran when user chooses fifth option
                case "Add New Department":
                    inquirer
                        .prompt([
                            {
                                message: "Name of department you would like to add?",
                                type: "input",
                                name: "department",
                                validate: answer => {
                                    if (answer !== "") {
                                        return true;
                                    }
                                    return "I'm sorry, please try again.";
                                }
                            }
                        ]).then(function (answer) {
                            
                            connection.query(
                                "INSERT INTO department SET name = ?",
                                [answer.department],
                                function (err) {
                                    if (err) throw err;
                                    promptUser();
                                }
                            )
                        });
                    break;

// Code ran when user chooses sixth option
                case "Add New Role":
                    connection.query("SELECT * FROM role", function (err, res) {
                        if (err) throw err;
                        console.table(res);
                        inquirer
                            .prompt([
                                {
                                    message: "Title of new role?",
                                    type: "input",
                                    name: "title",
                                    validate: answer => {
                                        if (answer !== "") {
                                            return true;
                                        }
                                        return "I'm sorry, please try again.";
                                    }
                                },
                                {
                                    message: "Salary of new role?",
                                    type: "input",
                                    name: "salary"
                                },
                                {
                                    message: "Please add department ID.",
                                    type: "input",
                                    name: "department"
                                }
                            ]).then(function (answer) {

                                connection.query(
                                    "INSERT INTO role SET title = ?, salary = ?, department_id = ?",
                                    [answer.title, answer.salary, answer.department],
                                    function (err) {
                                        if (err) throw err;
                                        promptUser();
                                    }
                                )
                            });
                    });
                    break;

// Code ran when user chooses seventh option
                case "Update Employee Role":
                    connection.query("SELECT * FROM employee", function (err, res) {
                        if (err) throw err;
                        console.table(res);

                        connection.query("SELECT * FROM role", function (err, res) {
                            if (err) throw err;
                            console.table(res);

                            inquirer
                             .prompt([
                                 {
                                     message: "What is the employee ID you would like to update?",
                                     type: "input",
                                     name: "id"
                                 },
                                 {
                                    message: "ID of new role you wish to assign to employee.",
                                    type: "input",
                                    name: "role"
                                }
                             ]).then(function (answer) {
                                 connection.query(
                                     "UPDATE employee SET role_id = ? WHERE id = ?",
                                     [answer.role, answer.id],
                                     function (err) {
                                         if (err) throw err;
                                         promptUser();
                                     }
                                 )
                             });
                        });
                    });
                    break;

                case "Remove Employee":
                    inquirer
                        .prompt([
                            {
                                message: "Enter ID of employee you wish to remove",
                                type: "input",
                                name: "id"
                            }
                        ]).then(function (answer) {

                            connection.query(
                                "DELETE FROM employee WHERE id = ?",
                                [answer.id],
                                function (err) {
                                    if (err) throw err;
                                    promptUser();
                                }
                            );
                        });
            };
        });
};

// app.listen(PORT, function() {
//     console.log("Server listening on: " + PORT);
// });