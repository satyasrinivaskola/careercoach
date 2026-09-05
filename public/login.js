const loginForm =
    document.getElementById("loginForm");


loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const email =
            document.getElementById("email").value;

        const password =
            document.getElementById("password").value;


        const message =
            document.getElementById("message");


        try {

            const response = await fetch(
                "/api/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


            const data =
                await response.json();


            console.log("Login response:", data);


            if (response.ok) {

                message.style.color = "green";

                message.textContent =
                    "Login successful";


                /*
                   Save logged-in user information
                   temporarily in browser.
                */

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );


                /*
                   Check user role
                */

                if (data.user.role === "admin") {

                    window.location.href =
                        "/admin-dashboard.html";

                }

                else {

                    window.location.href =
                        "/student-dashboard.html";

                }

            }

            else {

                message.style.color = "red";

                message.textContent =
                    data.error;

            }

        }

        catch (error) {

            console.error(
                "Login error:",
                error
            );

            message.style.color = "red";

            message.textContent =
                "Unable to connect to server";

        }

    }
);