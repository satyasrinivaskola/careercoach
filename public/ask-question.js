const userData = localStorage.getItem("user");


// Check login
if (!userData) {

    window.location.href = "/login.html";

} else {

    const user = JSON.parse(userData);


    // Only students can access this page
    if (user.role !== "student") {

        window.location.href =
            "/admin-dashboard.html";

    }


    const questionForm =
        document.getElementById("questionForm");

    const message =
        document.getElementById("message");

    const logoutBtn =
        document.getElementById("logoutBtn");


    // ==========================================
    // SUBMIT QUESTION
    // ==========================================

    questionForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const question =
                document
                    .getElementById("question")
                    .value
                    .trim();


            if (!question) {

                message.style.color = "red";

                message.textContent =
                    "Please enter your question.";

                return;
            }


            console.log(
                "Logged-in student:",
                user
            );


            try {

                const response = await fetch(
                    "https://careercoach-oyy5.onrender.com/api/questions",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            student_id: user.id,

                            student_name: user.name,

                            question: question

                        })
                    }
                );


                const data =
                    await response.json();


                console.log(
                    "Question response:",
                    data
                );


                if (response.ok) {

                    message.style.color =
                        "green";

                    message.textContent =
                        "Question submitted successfully!";


                    // Clear textarea
                    document.getElementById(
                        "question"
                    ).value = "";


                } else {

                    message.style.color =
                        "red";

                    message.textContent =
                        data.error ||
                        "Failed to submit question.";

                }


            } catch (error) {

                console.error(
                    "Question Submit Error:",
                    error
                );

                message.style.color =
                    "red";

                message.textContent =
                    "Unable to connect to server.";

            }

        }
    );


    // ==========================================
    // LOGOUT
    // ==========================================

    logoutBtn.addEventListener(
        "click",
        function() {

            localStorage.removeItem("user");

            window.location.href =
                "/login.html";

        }
    );

}