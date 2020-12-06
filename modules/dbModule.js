const Sequelize = require("sequelize");

var sequelize = new Sequelize('d90bbgdvrdg9pk', 'thopnxvowkxmyq', '6822078e24814aba7bfb252b0a971c71504533f250a87fee5082dc409f30ff8d', {
    host: 'ec2-3-210-23-22.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: {rejectUnauthorized: false}
    }
});

var Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER, 
        primaryKey: true, 
        autoIncrement: true
    }, 
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    hireDate: Sequelize.STRING
}, {
    createdAt: false, 
    updatedAt: false
});

var Department = sequelize.define('Department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }, 
    departmentName: Sequelize.STRING
}, {
    createdAt: false,
    updatedAt: false
});

Department.hasMany(Employee, {foreignKey: 'department'});

module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync()
        .then(() => {
            resolve();
        }).catch((err) => {
            console.log(err);
            reject("unable to sync the database");
        });
    });
}

module.exports.getAllEmployees = function() {
    return new Promise((resolve, reject) => {
        Employee.findAll().then((data) => {
            data = data.map(value => value.dataValues);
            resolve(data);
        }).catch((err) => {
            console.log(err);
            reject("no results returned");
        });
    });
}

module.exports.getDepartments = function() {
    return new Promise((resolve, reject) => {
        Department.findAll().then((data) => {
            data = data.map(value => value.dataValues);
            resolve(data);
        }).catch((err) => {
            console.log(err);
            reject("no results returned");
        });
    });
}

module.exports.getEmployeesByDepartment = function(department) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where: {department: department}
        }).then((data) => {
            data = data.map(value => value.dataValues);
            resolve(data);
        }).catch((err) => {
            console.log(err);
            reject("no results returned");
        });
    });
}

module.exports.getManagers = function() {
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where: {isManager: true}
        }).then((data) => {
            data = data.map(value => value.dataValues);
            resolve(data);
        }).catch((err) => {
            console.log(err);
            reject("no results returned");
        });
    });
}

module.exports.getEmployeeByNum = function(num) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where: {employeeNum: num}
        }).then((data) => {
            data = data.map(value => value.dataValues);
            resolve(data[0]);
        }).catch((err) => {
            console.log(err);
            reject("no results returned");
        });
    });
}

module.exports.getDepartmentById = function(id) {
    return new Promise((resolve, reject) => {
        Department.findAll({
            where: {departmentId: id}
        }).then((data) => {
            data = data.map(value => value.dataValues);
            resolve(data[0]);
        }).catch((err) => {
            console.log(err);
            reject("no results returned");
        });
    });
}

module.exports.addEmployee = function(employeeData) {
    return new Promise((resolve, reject) => {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for (let prop in employeeData) {
            if (employeeData[prop] == '') {
                employeeData[prop] = null;
            }
        }
        Employee.create(employeeData).then(() => {
            resolve("employee added");
        }).catch(() => {
            reject("unable to create employee");
        });
    });
}

module.exports.addDepartment = function(departmentData) {
    return new Promise((resolve, reject) => {
        for (let prop in departmentData) {
            if (departmentData[prop] == '') {
                departmentData[prop] = null;
            }
        }
        Department.create(departmentData).then(() => {
            resolve("department added");
        }).catch(() => {
            reject("unable to create department");
        });
    });
}

module.exports.updateEmployee = function(employeeData) {
    return new Promise((resolve, reject) => {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for (let prop in employeeData) {
            if (employeeData[prop] == '') {
                employeeData[prop] = null;
            }
        }
        Employee.update(employeeData,{
            where: {employeeNum: employeeData.employeeNum}
        }).then(() => {
            resolve("employee successfully updated");
        }).catch(() => {
            reject("unable to update employee");
        });
    });
}

module.exports.updateDepartment = function(departmentData) {
    return new Promise((resolve, reject) => {
        for (let prop in departmentData) {
            if (departmentData[prop] == '') {
                departmentData[prop] = null;
            }
        }
        Department.update(departmentData,{
            where: {departmentId: departmentData.departmentId}
        }).then(() => {
            resolve("department successfully updated");
        }).catch(() => {
            reject("unable to update department");
        });
    });
}

module.exports.deleteEmployeeByNum = function(empNum) {
    return new Promise((resolve, reject) => {
        Employee.destroy({
            where: {employeeNum: empNum}
        }).then(() => {
            resolve("employee successfully deleted");
        }).catch(() =>{
            reject("unable to delete employee");
        })
    });
}

module.exports.deleteDepartmentById = function(id) {
    return new Promise((resolve, reject) => {
        Department.destroy({
            where: {departmentId: id}
        }).then(() => {
            resolve("department successfully deleted");
        }).catch(() =>{
            reject("unable to delete department");
        })
    });
}