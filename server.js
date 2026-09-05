const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
dotenv.config();

const pool = require("./db.js");

const app = express();


// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static("public"));


// Test DB Connection
pool.getConnection()
    .then((connection) => {

        console.log("Connected to MySQL successfully!");

        connection.release();

    })
    .catch((err) => {

        console.error(
            "MySQL Connection Error:",
            err.message
        );

    });


// GET DATA
app.get("/data", async (req, res) => {

    try {

        const [rows] = await pool.execute(
            "SELECT id, name, email, role, created_at FROM users"
        );

        console.log(rows);

        res.json(rows);

    }

    catch (error) {

        console.error(
            "Data Route Error:",
            error.message
        );

        res.status(500).json({
            error: "Failed to fetch users."
        });

    }

});

// GET STUDENT PROFILE
app.get("/api/profile", async (req, res) => {

    try {

        const { email } = req.query;


        if (!email) {
            return res.status(400).json({
                error: "Email is required"
            });
        }


        const [users] = await pool.execute(
            `SELECT
                id,
                name,
                email,
                phone,
                qualification,
                specialization,
                college,
                passing_year,
                skills
             FROM users
             WHERE email = ?`,
            [email]
        );


        if (users.length === 0) {
            return res.status(404).json({
                error: "User not found"
            });
        }


        res.json({
            user: users[0]
        });


    } catch (error) {

        console.error(
            "Get Profile Error:",
            error.message
        );

        res.status(500).json({
            error: "Failed to load profile"
        });
    }
});
app.put("/api/profile", async (req, res) => {

    try {

        const {
            email,
            phone,
            qualification,
            specialization,
            college,
            passing_year,
            skills
        } = req.body;


        console.log(
            "Profile update received:",
            req.body
        );


        if (!email) {
            return res.status(400).json({
                error: "Email is required"
            });
        }


        const [result] = await pool.execute(
            `UPDATE users
             SET
                phone = ?,
                qualification = ?,
                specialization = ?,
                college = ?,
                passing_year = ?,
                skills = ?
             WHERE email = ?`,
            [
                phone || null,
                qualification || null,
                specialization || null,
                college || null,
                passing_year || null,
                skills || null,
                email
            ]
        );


        console.log(
            "Rows updated:",
            result.affectedRows
        );


        if (result.affectedRows === 0) {

            return res.status(404).json({
                error:
                    "User not found or no changes made"
            });
        }


        res.json({
            message:
                "Profile updated successfully"
        });


    } catch (error) {

        console.error(
            "Update Profile Error:",
            error.message
        );

        res.status(500).json({
            error: "Profile update failed"
        });
    }
});
// ========================================
// REGISTER POST
// ========================================

app.post("/api/register", async (req, res) => {

    try {

        console.log("Register POST received");

        console.log(req.body);


        const {
            name,
            email,
            password
        } = req.body;

const role = "student";
        // Check fields
        if (!name || !email || !password || !role) {

            return res.status(400).json({
                error: "All fields are required"
            });

        }


        // Check email already exists
        const [existingUser] = await pool.execute(

            "SELECT id FROM users WHERE email = ?",

            [email]

        );


        if (existingUser.length > 0) {

            return res.status(400).json({
                error: "Email already registered"
            });

        }


        // Hash password
        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


        // Insert user
        const [result] = await pool.execute(

            `INSERT INTO users
            (name, email, password, role)
            VALUES (?, ?, ?, ?)`,

            [
                name,
                email,
                hashedPassword,
                role
            ]

        );


        console.log(
            "User inserted with ID:",
            result.insertId
        );


        res.status(201).json({

            message: "Registration successful",

            userId: result.insertId

        });

    }

    catch (error) {

        console.error(
            "Registration Error:",
            error.message
        );

        res.status(500).json({

            error: "Registration failed"

        });

    }

});

// LOGIN
app.post("/api/login", async (req, res) => {

    try {

        console.log("Login POST received");

        const {
            email,
            password
        } = req.body;


        // Check required fields

        if (!email || !password) {

            return res.status(400).json({
                error: "Email and password are required"
            });

        }


        // Find user

        const [users] = await pool.execute(
            `SELECT
                id,
                name,
                email,
                password,
                role
             FROM users
             WHERE email = ?`,
            [email]
        );


        // User doesn't exist

        if (users.length === 0) {

            return res.status(401).json({
                error: "Invalid email or password"
            });

        }


        const user = users[0];


        // Compare password

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({
                error: "Invalid email or password"
            });

        }


        // Don't send password to browser

        delete user.password;


        // Login successful

        res.status(200).json({

            message: "Login successful",

            user: user

        });

    }

    catch (error) {

        console.error(
            "Login Error:",
            error.message
        );


        res.status(500).json({

            error: "Login failed"

        });

    }

});
// ==========================================
// SAVE STUDENT QUESTION
// ==========================================

// STUDENT - CREATE NEW QUESTION / CHAT
app.post("/api/questions", async (req, res) => {
    const connection = await pool.getConnection();

    try {

        const {
            student_id,
            student_name,
            question
        } = req.body;


        console.log(
            "Question received:",
            req.body
        );


        if (!student_id || !student_name || !question) {

            return res.status(400).json({
                error:
                    "Student ID, student name and question are required"
            });

        }


        // Check student
        const [students] = await connection.execute(
            `SELECT id, name
             FROM users
             WHERE id = ?
             AND role = 'student'`,
            [student_id]
        );


        if (students.length === 0) {

            return res.status(404).json({
                error: "Student not found"
            });

        }


        // Start transaction
        await connection.beginTransaction();


        // 1. Create question
        const [questionResult] =
            await connection.execute(
                `INSERT INTO queries
                (
                    student_id,
                    student_name,
                    question,
                    status
                )
                VALUES (?, ?, ?, ?)`,
                [
                    student_id,
                    students[0].name,
                    question.trim(),
                    "Pending"
                ]
            );


        const questionId =
            questionResult.insertId;


        console.log(
            "Question created:",
            questionId
        );


        // 2. Create first chat message
        await connection.execute(
            `INSERT INTO messages
            (
                question_id,
                sender_id,
                sender_role,
                message
            )
            VALUES (?, ?, ?, ?)`,
            [
                questionId,
                student_id,
                "student",
                question.trim()
            ]
        );


        console.log(
            "First chat message created"
        );


        // Complete transaction
        await connection.commit();


        res.status(201).json({

            message:
                "Question submitted successfully",

            questionId:
                questionId

        });


    } catch (error) {

        // Undo database changes if something fails
        await connection.rollback();


        console.error(
            "Question Insert Error:",
            error.message
        );


        res.status(500).json({
            error:
                "Failed to submit question"
        });


    } finally {

        connection.release();

    }
}); 
// ADMIN - GET LATEST QUESTION FROM EACH STUDENT
app.get("/api/admin/questions", async (req, res) => {
    try {
        const [questions] = await pool.execute(
            `SELECT
                id,
                student_id,
                student_name,
                question,
                admin_reply,
                status,
                created_at
             FROM (
                SELECT
                    q.*,
                    ROW_NUMBER() OVER (
                        PARTITION BY student_id
                        ORDER BY created_at DESC, id DESC
                    ) AS row_num
                FROM queries q
             ) AS latest
             WHERE row_num = 1
             ORDER BY created_at DESC, id DESC`
        );

        console.log(
            "Latest questions for admin:",
            questions
        );

        res.json(questions);

    } catch (error) {
        console.error(
            "Admin Questions Error:",
            error.message
        );

        res.status(500).json({
            error: "Failed to load questions"
        });
    }
});
// ADMIN - GET STUDENT DETAILS AND ALL QUESTIONS
app.get("/api/admin/student/:id", async (req, res) => {
    try {
        const studentId = req.params.id;

        console.log(
            "Loading student details for ID:",
            studentId
        );

        // Get student profile
        const [students] = await pool.execute(
            `SELECT
                id,
                name,
                email,
                phone,
                qualification,
                specialization,
                college,
                passing_year,
                skills
             FROM users
             WHERE id = ?
             AND role = 'student'`,
            [studentId]
        );

        if (students.length === 0) {
            return res.status(404).json({
                error: "Student not found"
            });
        }

        // Get ALL questions from this student
        const [questions] = await pool.execute(
            `SELECT
                id,
                student_id,
                student_name,
                question,
                admin_reply,
                status,
                created_at
             FROM queries
             WHERE student_id = ?
             ORDER BY created_at DESC, id DESC`,
            [studentId]
        );

        console.log(
            "Student:",
            students[0]
        );

        console.log(
            "Questions:",
            questions
        );

        res.json({
            student: students[0],
            questions: questions
        });

    } catch (error) {

        console.error(
            "Student Details Error:",
            error.message
        );

        res.status(500).json({
            error: "Failed to load student details"
        });
    }
});
// ADMIN - REPLY TO A SPECIFIC QUESTION
app.put("/api/admin/questions/:questionId/reply", async (req, res) => {
    try {

        const questionId =
            req.params.questionId;

        const { admin_reply } =
            req.body;


        console.log(
            "Admin reply received:",
            {
                questionId,
                admin_reply
            }
        );


        // Validate reply
        if (!admin_reply || !admin_reply.trim()) {

            return res.status(400).json({
                error: "Reply cannot be empty"
            });

        }


        // Check whether question exists
        const [questions] = await pool.execute(
            `SELECT id
             FROM queries
             WHERE id = ?`,
            [questionId]
        );


        if (questions.length === 0) {

            return res.status(404).json({
                error: "Question not found"
            });

        }


        // Update exact question
        const [result] = await pool.execute(
            `UPDATE queries
             SET
                admin_reply = ?,
                status = 'Replied'
             WHERE id = ?`,
            [
                admin_reply.trim(),
                questionId
            ]
        );


        console.log(
            "Question updated:",
            result.affectedRows
        );


        res.json({
            message:
                "Reply submitted successfully"
        });


    } catch (error) {

        console.error(
            "Admin Reply Error:",
            error.message
        );


        res.status(500).json({
            error:
                "Failed to submit reply"
        });

    }
});
// GET CHAT MESSAGES FOR ONE QUESTION
app.get("/api/questions/:questionId/messages", async (req, res) => {
    try {

        const questionId = req.params.questionId;

        console.log(
            "Loading chat for question:",
            questionId
        );


        // 1. Get the question
        const [questions] = await pool.execute(
            `SELECT
                id,
                student_id,
                student_name,
                question,
                status,
                created_at
             FROM queries
             WHERE id = ?`,
            [questionId]
        );


        // Question not found
        if (questions.length === 0) {

            return res.status(404).json({
                error: "Question not found"
            });

        }


        // 2. Get all messages for this question
        const [messages] = await pool.execute(
            `SELECT
                id,
                question_id,
                sender_id,
                sender_role,
                message,
                created_at
             FROM messages
             WHERE question_id = ?
             ORDER BY created_at ASC, id ASC`,
            [questionId]
        );


        console.log(
            "Question:",
            questions[0]
        );

        console.log(
            "Messages:",
            messages
        );


        // 3. Send question + complete chat
        res.json({

            question: questions[0],

            messages: messages

        });


    } catch (error) {

        console.error(
            "Get Chat Error:",
            error.message
        );

        res.status(500).json({
            error: "Failed to load chat"
        });

    }
});
// SEND CHAT MESSAGE
app.post("/api/questions/:questionId/messages", async (req, res) => {

    const connection = await pool.getConnection();

    try {

        const questionId = req.params.questionId;

        const {
            sender_id,
            sender_role,
            message
        } = req.body;


        console.log(
            "Chat message received:",
            req.body
        );


        // 1. Validate message
        if (
            !sender_id ||
            !sender_role ||
            !message ||
            !message.trim()
        ) {

            return res.status(400).json({
                error:
                    "Sender ID, sender role and message are required"
            });

        }


        // 2. Validate sender role
        if (
            sender_role !== "student" &&
            sender_role !== "admin"
        ) {

            return res.status(400).json({
                error:
                    "Invalid sender role"
            });

        }


        // 3. Check question exists
        const [questions] = await connection.execute(
            `SELECT
                id,
                student_id
             FROM queries
             WHERE id = ?`,
            [questionId]
        );


        if (questions.length === 0) {

            return res.status(404).json({
                error:
                    "Question not found"
            });

        }


        // 4. Check sender exists
        const [users] = await connection.execute(
            `SELECT
                id,
                role
             FROM users
             WHERE id = ?`,
            [sender_id]
        );


        if (users.length === 0) {

            return res.status(404).json({
                error:
                    "Sender not found"
            });

        }


        // 5. Check sender role matches database role
        if (
            users[0].role !== sender_role
        ) {

            return res.status(403).json({
                error:
                    "Sender role does not match user role"
            });

        }


        // 6. Student can only reply to their own question
        if (
            sender_role === "student" &&
            Number(questions[0].student_id) !== Number(sender_id)
        ) {

            return res.status(403).json({
                error:
                    "Student cannot reply to another student's question"
            });

        }


        // Start transaction
        await connection.beginTransaction();


        // 7. Insert message
        const [messageResult] =
            await connection.execute(
                `INSERT INTO messages
                (
                    question_id,
                    sender_id,
                    sender_role,
                    message
                )
                VALUES (?, ?, ?, ?)`,
                [
                    questionId,
                    sender_id,
                    sender_role,
                    message.trim()
                ]
            );


        // 8. Update question status
        let status;

        if (sender_role === "admin") {
            status = "Replied";
        } else {
            status = "Pending";
        }


        await connection.execute(
            `UPDATE queries
             SET status = ?
             WHERE id = ?`,
            [
                status,
                questionId
            ]
        );


        // Complete transaction
        await connection.commit();


        console.log(
            "Chat message inserted:",
            messageResult.insertId
        );


        res.status(201).json({

            message:
                "Message sent successfully",

            messageId:
                messageResult.insertId,

            status:
                status

        });


    } catch (error) {

        await connection.rollback();

        console.error(
            "Send Chat Message Error:",
            error.message
        );

        res.status(500).json({
            error:
                "Failed to send message"
        });


    } finally {

        connection.release();

    }

});
// STUDENT - GET ALL MY QUESTIONS
app.get("/api/my-questions/:studentId", async (req, res) => {

    try {

        const studentId =
            req.params.studentId;


        console.log(
            "Loading questions for student:",
            studentId
        );


        // Check student
        const [students] =
            await pool.execute(
                `SELECT
                    id,
                    name
                 FROM users
                 WHERE id = ?
                 AND role = 'student'`,
                [studentId]
            );


        if (students.length === 0) {

            return res.status(404).json({
                error:
                    "Student not found"
            });

        }


        // Get all questions
        const [questions] =
            await pool.execute(
                `SELECT
                    id,
                    student_id,
                    student_name,
                    question,
                    status,
                    created_at
                 FROM queries
                 WHERE student_id = ?
                 ORDER BY created_at DESC, id DESC`,
                [studentId]
            );


        console.log(
            "Student questions:",
            questions
        );


        res.json({
            questions: questions
        });


    } catch (error) {

        console.error(
            "My Questions Error:",
            error.message
        );


        res.status(500).json({
            error:
                "Failed to load questions"
        });

    }

});
const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {

    console.log(
        `Server connected to port ${PORT}`
    );

});