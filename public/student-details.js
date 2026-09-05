const userData = localStorage.getItem("user");


// =====================================
// CHECK ADMIN LOGIN
// =====================================

if (!userData) {

    window.location.href = "/login.html";

} else {

    const user = JSON.parse(userData);


    if (user.role !== "admin") {

        window.location.href =
            "/student-dashboard.html";

    } else {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const studentId =
            params.get("id");


        const selectedQuestionId =
            params.get("questionId");


        const message =
            document.getElementById(
                "message"
            );


        const questionsList =
            document.getElementById(
                "questionsList"
            );


        const logoutBtn =
            document.getElementById(
                "logoutBtn"
            );


        // =====================================
        // VALIDATE STUDENT ID
        // =====================================

        if (!studentId) {

            message.textContent =
                "Student ID is missing.";

        } else {

            loadStudentDetails();

        }


        // =====================================
        // LOAD STUDENT DETAILS
        // =====================================

        async function loadStudentDetails() {

            try {

                const response =
                    await fetch(
                        `/api/admin/student/${studentId}`
                    );


                const data =
                    await response.json();


                console.log(
                    "Student details:",
                    data
                );


                if (!response.ok) {

                    message.textContent =
                        data.error ||
                        "Failed to load student";

                    return;

                }


                // =================================
                // PROFILE
                // =================================

                const student =
                    data.student;


                document.getElementById(
                    "studentName"
                ).textContent =
                    student.name || "-";


                document.getElementById(
                    "studentEmail"
                ).textContent =
                    student.email || "-";


                document.getElementById(
                    "studentPhone"
                ).textContent =
                    student.phone || "-";


                document.getElementById(
                    "studentQualification"
                ).textContent =
                    student.qualification || "-";


                document.getElementById(
                    "studentSpecialization"
                ).textContent =
                    student.specialization || "-";


                document.getElementById(
                    "studentCollege"
                ).textContent =
                    student.college || "-";


                document.getElementById(
                    "studentPassingYear"
                ).textContent =
                    student.passing_year || "-";


                document.getElementById(
                    "studentSkills"
                ).textContent =
                    student.skills || "-";


                // =================================
                // QUESTIONS
                // =================================

                const questions =
                    data.questions;


                if (
                    !questions ||
                    questions.length === 0
                ) {

                    questionsList.innerHTML =
                        "<p>No questions found.</p>";

                    return;

                }


                questionsList.innerHTML = "";


                questions.forEach(
                    function (item) {

                        const questionCard =
                            document.createElement(
                                "div"
                            );


                        questionCard.className =
                            "question-card";


                        questionCard.innerHTML = `

                            <div class="question-header">

                                <h4>
                                    Question #${item.id}
                                </h4>

                                <span class="status">
                                    ${item.status}
                                </span>

                            </div>


                            <div class="original-question">

                                <strong>
                                    Question:
                                </strong>

                                <p>
                                    ${item.question}
                                </p>

                            </div>


                            <div
                                class="chat-container"
                                id="chat-${item.id}">

                                <div class="chat-messages">

                                    Loading conversation...

                                </div>


                                <form
                                    class="chat-form"
                                    data-question-id="${item.id}">

                                    <textarea
                                        class="chat-input"
                                        rows="3"
                                        placeholder="Type your reply..."
                                        required></textarea>


                                    <button type="submit">
                                        Send Reply
                                    </button>

                                </form>

                            </div>

                        `;


                        questionsList.appendChild(
                            questionCard
                        );

                    }
                );


                // =================================
                // LOAD ALL CHATS
                // =================================

                questions.forEach(
                    function (item) {

                        loadChat(
                            item.id
                        );

                    }
                );


                // =================================
                // FORM EVENTS
                // =================================

                const chatForms =
                    document.querySelectorAll(
                        ".chat-form"
                    );


                chatForms.forEach(
                    function (form) {

                        form.addEventListener(
                            "submit",
                            function (event) {

                                sendMessage(
                                    event,
                                    form
                                );

                            }
                        );

                    }
                );


                // Scroll selected question into view
                if (selectedQuestionId) {

                    setTimeout(
                        function () {

                            const selected =
                                document.getElementById(
                                    `chat-${selectedQuestionId}`
                                );


                            if (selected) {

                                selected.scrollIntoView({
                                    behavior: "smooth",
                                    block: "center"
                                });

                            }

                        },
                        500
                    );

                }


            } catch (error) {

                console.error(
                    "Student Details Error:",
                    error
                );


                message.textContent =
                    "Unable to connect to server.";

            }

        }


        // =====================================
        // LOAD CHAT
        // =====================================

        async function loadChat(
            questionId
        ) {

            const chatContainer =
                document.getElementById(
                    `chat-${questionId}`
                );


            const chatMessages =
                chatContainer.querySelector(
                    ".chat-messages"
                );


            try {

                const response =
                    await fetch(
                        `/api/questions/${questionId}/messages`
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    chatMessages.innerHTML =
                        `<p>
                            ${data.error ||
                            "Failed to load chat"}
                        </p>`;

                    return;

                }


                chatMessages.innerHTML = "";


                data.messages.forEach(
                    function (item) {

                        const messageDiv =
                            document.createElement(
                                "div"
                            );


                        messageDiv.className =
                            `chat-message ${item.sender_role}`;


                        const senderName =
                            item.sender_role ===
                            "admin"
                                ? "Admin"
                                : data.question.student_name;


                        messageDiv.innerHTML = `

                            <div class="message-sender">

                                ${senderName}

                            </div>


                            <div class="message-text">

                                ${item.message}

                            </div>


                            <div class="message-time">

                                ${new Date(
                                    item.created_at
                                ).toLocaleString()}

                            </div>

                        `;


                        chatMessages.appendChild(
                            messageDiv
                        );

                    }
                );


                chatMessages.scrollTop =
                    chatMessages.scrollHeight;


            } catch (error) {

                console.error(
                    "Load Chat Error:",
                    error
                );


                chatMessages.innerHTML =
                    "<p>Unable to load chat.</p>";

            }

        }


        // =====================================
        // SEND ADMIN MESSAGE
        // =====================================

        async function sendMessage(
            event,
            form
        ) {

            event.preventDefault();


            const questionId =
                form.dataset.questionId;


            const input =
                form.querySelector(
                    ".chat-input"
                );


            const messageText =
                input.value.trim();


            if (!messageText) {

                return;

            }


            try {

                const response =
                    await fetch(
                        `https://careercoach-oyy5.onrender.com/api/questions/${questionId}/messages`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                sender_id:
                                    user.id,

                                sender_role:
                                    "admin",

                                message:
                                    messageText

                            })

                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "Admin message:",
                    data
                );


                if (!response.ok) {

                    alert(
                        data.error ||
                        "Failed to send reply"
                    );

                    return;

                }


                // Clear input
                input.value = "";


                // Reload this conversation
                await loadChat(
                    questionId
                );


            } catch (error) {

                console.error(
                    "Send Message Error:",
                    error
                );


                alert(
                    "Unable to connect to server"
                );

            }

        }


        // =====================================
        // LOGOUT
        // =====================================

        logoutBtn.addEventListener(
            "click",
            function () {

                localStorage.removeItem(
                    "user"
                );

                window.location.href =
                    "/login.html";

            }
        );

    }

}