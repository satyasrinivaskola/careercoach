const registerForm =
    document.getElementById("registerForm")

// alert("Hello satya")



registerForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        console.log("Hello Register");


        const name =
            document.getElementById("name").value;

        const email =
            document.getElementById("email").value;

        const password =
            document.getElementById("password").value;

      


        console.log("Name:", name);
        console.log("Email:", email);
        console.log("Password:", password);
  


        try {

            const response = await fetch(
                "/api/register",
                {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        name: name,

                        email: email,

                        password: password

                   

                    })

                }
            );


            const data = await response.json();


            console.log("Server response:", data);


            const message =
                document.getElementById("responseMsg");


            if (response.ok) {

                message.style.color = "green";

                message.innerText =
                    data.message;

                registerForm.reset();
                alert("Data registered")
window.location.href("index.html")
            }

            else {

                message.style.color = "red";

                message.innerText =
                    data.error;

            }

        }

        catch (error) {

            console.error(
                "Fetch error:",
                error
            );

        }

    }
);