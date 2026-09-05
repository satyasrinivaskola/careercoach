const userData =
    localStorage.getItem("user");


if (!userData) {

    window.location.href =
        "/login.html";

} else {

    const user =
        JSON.parse(userData);


    // Only students can access this page
    if (user.role !== "student") {

        window.location.href =
            "/admin-dashboard.html";

    } else {


        const questionsList =
            document.getElementById(
                "questionsList"
            );


        const message =
            document.getElementById(
                "message"
            );


        const logoutBtn =
            document.getElementById(
                "logoutBtn"
            );


        // =====================================
        // LOAD QUESTIONS
        // =====================================

        async function loadQuestions() {

            try {

                const response =
                    await fetch(
                        `/api/my-questions/${user.id}`
                    );


                const data =
                    await response.json();


                console.log(
                    "My questions:",
                    data
                );


                if (!response.ok) {

                    questionsList.innerHTML =
                        `<p>
                            ${data.error ||
                            "Failed to load questions"}
                        </p>`;

                    return;
                }


                const questions =
                    data.questions;


                if (
                    questions.length === 0
                ) {

                    questionsList.innerHTML =
                        `
                        <div class="empty-message">

                            <p>
                                You have not asked
                                any questions yet.
                            </p>

                            <a href="/ask-question.html">
                                Ask a Question
                            </a>

                        </div>
                        `;

                    return;
                }


                questionsList.innerHTML =
                    "";


                questions.forEach(
                    function (item) {

                        const card =
                            document.createElement(
                                "div"
                            );


                        card.className =
                            "question-card";


                        card.innerHTML = `

                            <div class="question-header">

                                <h3>
                                    Question #${item.id}
                                </h3>

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


                            <button
                                class="chat-button"
                                data-question-id="${item.id}">

                                Open Conversation

                            </button>


                            <div
                                class="chat-container"
                                id="chat-${item.id}"
                                style="display:none;">

                                <div class="chat-messages">

                                    Loading conversation...

                                </div>


                                <form
                                    class="chat-form"
                                    data-question-id="${item.id}">

                                    <textarea
                                        class="chat-input"
                                        rows="3"
                                        placeholder="Type your message..."
                                        required></textarea>


                                    <button type="submit">
                                        Send Message
                                    </button>

                                </form>

                            </div>

                        `;


                        questionsList.appendChild(
                            card
                        );

                    }
                );


                // =====================================
                // CHAT BUTTONS
                // =====================================

                const chatButtons =
                    document.querySelectorAll(
                        ".chat-button"
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


                // =====================================
                // CHAT FORMS
                // =====================================

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


        // =====================================
        // OPEN CHAT
        // =====================================

        async function openChat(
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


            // Show / hide chat
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
                    "Conversation:",
                    data
                );


                if (!response.ok) {

                    chatMessages.innerHTML =
                        `<p>
                            ${data.error ||
                            "Failed to load conversation"}
                        </p>`;

                    return;

                }


                chatMessages.innerHTML =
                    "";


                data.messages.forEach(
                    function (item) {

                        const messageDiv =
                            document.createElement(
                                "div"
                            );


                        messageDiv.className =
                            `chat-message ${item.sender_role}`;


                        let senderName;


                        if (
                            item.sender_role ===
                            "student"
                        ) {

                            senderName =
                                user.name;

                        } else {

                            senderName =
                                "Admin";

                        }


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
                    "Open Chat Error:",
                    error
                );


                chatMessages.innerHTML =
                    "<p>Unable to load conversation.</p>";

            }

        }


        // =====================================
        // SEND STUDENT MESSAGE
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
                        `/api/questions/${questionId}/messages`,
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
                                    "student",

                                message:
                                    messageText

                            })

                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "Send message:",
                    data
                );


                if (!response.ok) {

                    alert(
                        data.error ||
                        "Failed to send message"
                    );

                    return;

                }


                input.value = "";


                // Reload the page data
                await loadQuestions();


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


        // Start
        loadQuestions();

    }

}