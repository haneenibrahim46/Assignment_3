const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.use(express.json());

const filePath = "./users.json";

function readUsers() {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
}

function writeUsers(users) {
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
}

// add user

app.post("/user", (req, res) => {
    const { name, age, email } = req.body;
    const users = readUsers();

    const emailExists = users.some(user => user.email === email);

    if (emailExists) {
        return res.json({
            message: "Email already exists."
        });
    }

    let newId = 1;

    if (users.length > 0) {
        newId = Math.max(...users.map(user => user.id)) + 1;
    }

    const newUser = {
        id: newId,
        name: name,
        age: age,
        email: email
    };
    users.push(newUser);
    writeUsers(users);
    res.json({
        message: "User added successfully."
    });
});


// update user

app.patch("/user/:id", (req, res) => {
    const id = Number(req.params.id);

    const users = readUsers();

    const user = users.find(user => user.id === id);

    if (!user) {
        return res.json({
            message: "User ID not found."
        });
    }

    if (req.body.name !== undefined) {
        user.name = req.body.name;
    }

    if (req.body.age !== undefined) {
        user.age = req.body.age;
    }

    if (req.body.email !== undefined) {

        const emailExists = users.some(
            otherUser =>
                otherUser.id !== id &&
                otherUser.email === req.body.email
        );

        if (emailExists) {
            return res.json({
                message: "Email already exists."
            });
        }

        user.email = req.body.email;
    }

    writeUsers(users);

    res.json({
        message: "User updated successfully."
    });
});


// delete user by id

app.delete("/user/:id", (req, res) => {

    let id = Number(req.params.id);

    if (!id && req.body.id) {
        id = Number(req.body.id);
    }

    if (!id && req.query.id) {
        id = Number(req.query.id);
    }

    const users = readUsers();
    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex === -1) {
        return res.json({
            message: "User ID not found."
        });
    }

    users.splice(userIndex, 1);

    writeUsers(users);

    res.json({
        message: "User deleted successfully."
    });
});


// get user by name

app.get("/user/getByName", (req, res) => {
    const name = req.query.name;
    const users = readUsers();
    const user = users.find(user => user.name === name);

    if (!user) {
        return res.json({
            message: "User name not found."
        });
    }

    res.json(user);
});


// get all users

app.get("/user", (req, res) => {
    const users = readUsers();

    res.json(users);
});


// filter users by minimum age

app.get("/user/filter", (req, res) => {
    const minAge = Number(req.query.minAge);

    const users = readUsers();

    const filteredUsers = users.filter(user => user.age >= minAge);

    if (filteredUsers.length === 0) {
        return res.json({
            message: "no user found"
        });
    }

    res.json(filteredUsers);
});


// get user by id

app.get("/user/:id", (req, res) => {
    const id = Number(req.params.id);

    const users = readUsers();

    const user = users.find(user => user.id === id);

    if (!user) {
        return res.json({
            message: "User not found."
        });
    }

    res.json(user);
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});