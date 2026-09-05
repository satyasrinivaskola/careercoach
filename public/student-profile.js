// ========================================
// GET VALUES FROM URL
// ========================================

const params = new URLSearchParams(window.location.search);

const nameFromUrl = params.get("name");
const emailFromUrl = params.get("email");

console.log("Name from URL:", nameFromUrl);
console.log("Email from URL:", emailFromUrl);


// ========================================
// GET LOGGED-IN USER
// ========================================

const userData = localStorage.getItem("user");

if (!userData) {

    window.location.href = "/login.html";

} else {

    const user = JSON.parse(userData);

    console.log("Logged-in user:", user);

    // ========================================
    // CHECK STUDENT ROLE
    // ========================================

    if (user.role !== "student") {

        window.location.href = "/admin-dashboard.html";

    }


    // ========================================
    // SET NAME AND EMAIL
    // ========================================

    const nameInput =
        document.getElementById("name");

    const emailInput =
        document.getElementById("email");


    nameInput.value =
        nameFromUrl || user.name || "";

    emailInput.value =
        emailFromUrl || user.email || "";


    console.log(
        "Name input:",
        nameInput.value
    );

    console.log(
        "Email input:",
        emailInput.value
    );


    // ========================================
    // LOAD OTHER PROFILE DETAILS
    // ========================================

    loadProfile(
        emailFromUrl || user.email
    );
}


// ========================================
// LOAD PROFILE FROM DATABASE
// ========================================

async function loadProfile(email) {

    try {

        const response =
            await fetch(
                `/api/profile?email=${encodeURIComponent(email)}`
            );

        const data =
            await response.json();

        console.log(
            "Profile data:",
            data
        );


        if (!response.ok) {

            document.getElementById("message")
                .textContent =
                data.error ||
                "Failed to load profile";

            return;
        }


        const profile = data.user;


        // ========================================
        // NAME
        // ========================================

        document.getElementById("name").value =
            nameFromUrl ||
            profile.name ||
            "";


        // ========================================
        // EMAIL
        // ========================================

        document.getElementById("email").value =
            emailFromUrl ||
            profile.email ||
            "";


        // ========================================
        // OTHER DETAILS
        // ========================================

        document.getElementById("phone").value =
            profile.phone || "";

        document.getElementById("qualification").value =
            profile.qualification || "";

        document.getElementById("specialization").value =
            profile.specialization || "";

        document.getElementById("college").value =
            profile.college || "";

        document.getElementById("passing_year").value =
            profile.passing_year || "";

        document.getElementById("skills").value =
            profile.skills || "";

    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

        document.getElementById("message")
            .textContent =
            "Unable to load profile";
    }
}


// ========================================
// SAVE PROFILE
// ========================================

const profileForm =
    document.getElementById("profileForm");

profileForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const user =
            JSON.parse(
                localStorage.getItem("user")
            );

        const message =
            document.getElementById("message");


        const profileData = {

            email: user.email,

            phone:
                document.getElementById("phone")
                    .value.trim(),

            qualification:
                document.getElementById("qualification")
                    .value.trim(),

            specialization:
                document.getElementById("specialization")
                    .value.trim(),

            college:
                document.getElementById("college")
                    .value.trim(),

            passing_year:
                document.getElementById("passing_year")
                    .value,

            skills:
                document.getElementById("skills")
                    .value.trim()
        };


        console.log(
            "Profile data to save:",
            profileData
        );


        try {

            const response =
                await fetch(
                    "/api/profile",
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                profileData
                            )
                    }
                );


            const data =
                await response.json();


            if (response.ok) {

                message.style.color =
                    "green";

                message.textContent =
                    "Profile updated successfully";
                   alert("Profile updated successfully") 
window.location.href="student-dashboard.html"
            } else {

                message.style.color =
                    "red";

                message.textContent =
                    data.error ||
                    "Profile update failed";
            }

        } catch (error) {

            console.error(
                "Update profile error:",
                error
            );

            message.style.color =
                "red";

            message.textContent =
                "Unable to connect to server";
        }
    }
);


// ========================================
// LOGOUT
// ========================================

const logoutBtn =
    document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            localStorage.removeItem("user");

            window.location.href =
                "/login.html";
        }
    );
}