const userData = localStorage.getItem("user");


if (!userData) {

    window.location.href = "/login.html";

} else {

    const user = JSON.parse(userData);


    // Only admin can access this page
    if (user.role !== "admin") {

        window.location.href =
            "/student-dashboard.html";

    } else {

        const adminWelcome =
            document.getElementById("adminWelcome");

        const questionsList =
            document.getElementById("questionsList");

        const logoutBtn =
            document.getElementById("logoutBtn");


        adminWelcome.textContent =
            `Welcome, ${user.name}!`;


        // =========================================
        // LOAD LATEST QUESTIONS
        // =========================================

        async function loadQuestions() {

            try {

                const response =
                    await fetch(
                        "/api/admin/questions"
                    );


                const questions =
                    await response.json();


                console.log(
                    "Admin questions:",
                    questions
                );


                if (!response.ok) {

                    questionsList.innerHTML =
                        `<p>
                            ${questions.error ||
                            "Failed to load questions"}
                        </p>`;

                    return;
                }


                if (questions.length === 0) {

                    questionsList.innerHTML =
                        "<p>No questions available.</p>";

                    return;
                }


                questionsList.innerHTML = "";


                questions.forEach(
                    function (item) {

                        const questionCard =
                            document.createElement("div");


                        questionCard.className =
                            "question-card";


                        questionCard.innerHTML = `

                            <div class="question-header">

                             <h4>
    <a href="/student-details.html?id=${item.student_id}&questionId=${item.id}">
        ${item.student_name}
    </a>
</h4>

                                <span class="status">
                                    ${item.status}
                                </span>

                            </div>


                            <p class="question-text">
                                ${item.question}
                            </p>


                            <p class="question-date">
                                ${new Date(
                                    item.created_at
                                ).toLocaleString()}
                            </p>


                           
                            </div>

                        `;


                        questionsList.appendChild(
                            questionCard
                        );

                    }
                );


                // Add Open Chat events
                const chatButtons =
                    document.querySelectorAll(
                        ".open-chat-btn"
                    );


                chatButtons.forEach(
                    function (button) {

                        button.addEventListener(
                            "click",
                            function () {

                                const questionId =
                                    button.dataset.questionId;


                                openChat(
                                    questionId
                                );

                            }
                        );

                    }
                );


                // Add send-message events
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


            } catch (error) {

                console.error(
                    "Load Questions Error:",
                    error
                );


                questionsList.innerHTML =
                    "<p>Unable to connect to server.</p>";

            }

        }


        // =========================================
        // OPEN CHAT
        // =========================================

        async function openChat(questionId) {

            const chatContainer =
                document.getElementById(
                    `chat-${questionId}`
                );


            const chatMessages =
                chatContainer.querySelector(
                    ".chat-messages"
                );


            // Toggle chat
            if (
                chatContainer.style.display ===
                "none"
            ) {

                chatContainer.style.display =
                    "block";

            } else {

                chatContainer.style.display =
                    "none";

                return;
            }


            chatMessages.innerHTML =
                "<p>Loading conversation...</p>";


            try {

                const response =
                    await fetch(
                        `/api/questions/${questionId}/messages`
                    );


                const data =
                    await response.json();


                console.log(
                    "Chat:",
                    data
                );


                if (!response.ok) {

                    chatMessages.innerHTML =
                        `<p>
                            ${data.error ||
                            "Failed to load chat"}
                        </p>`;

                    return;
                }


                chatMessages.innerHTML = "";


                if (
                    data.messages.length === 0
                ) {

                    chatMessages.innerHTML =
                        "<p>No messages yet.</p>";

                    return;
                }


                data.messages.forEach(
                    function (message) {

                        const messageDiv =
                            document.createElement(
                                "div"
                            );


                        messageDiv.className =
                            `chat-message ${message.sender_role}`;


                        messageDiv.innerHTML = `

                            <div class="message-sender">
                                ${message.sender_role === "admin"
                                    ? "Admin"
                                    : message.sender_role === "student"
                                        ? data.question.student_name
                                        : message.sender_role}
                            </div>

                            <div class="message-text">
                                ${message.message}
                            </div>

                            <div class="message-time">
                                ${new Date(
                                    message.created_at
                                ).toLocaleString()}
                            </div>

                        `;


                        chatMessages.appendChild(
                            messageDiv
                        );

                    }
                );


                // Scroll to bottom
                chatMessages.scrollTop =
                    chatMessages.scrollHeight;


            } catch (error) {

                console.error(
                    "Open Chat Error:",
                    error
                );


                chatMessages.innerHTML =
                    "<p>Unable to load conversation.</p>";

            }

        }


        // =========================================
        // SEND ADMIN MESSAGE
        // =========================================

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


            const message =
                input.value.trim();


            if (!message) {

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
                                    message

                            })
                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "Send message response:",
                    data
                );


                if (!response.ok) {

                    alert(
                        data.error ||
                        "Failed to send message"
                    );

                    return;
                }


                // Clear input
                input.value = "";


                // Reload conversation
                await openChat(
                    questionId
                );

                // openChat toggles the chat.
                // Open it again if it became hidden.
                const chatContainer =
                    document.getElementById(
                        `chat-${questionId}`
                    );


                if (
                    chatContainer.style.display ===
                    "none"
                ) {

                    await openChat(
                        questionId
                    );

                }


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


        // =========================================
        // LOGOUT
        // =========================================

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


        // Load questions
        loadQuestions();

    }

}