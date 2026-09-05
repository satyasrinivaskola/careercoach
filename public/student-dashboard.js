// ========================================
// GET LOGGED-IN USER
// ========================================

const userData = localStorage.getItem("user");

if (!userData) {

    window.location.href = "/login.html";

} else {

    const user = JSON.parse(userData);

    const welcomeMessage =
        document.getElementById("welcomeMessage");

    welcomeMessage.textContent =
        `Welcome, ${user.name}!`;

    // Make sure only students access this page
    if (user.role !== "student") {

        window.location.href =
            "/admin-dashboard.html";
    }
}


// ========================================
// LOGOUT
// ========================================

const logoutBtn =
    document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", function () {

    localStorage.removeItem("user");

    window.location.href =
        "/login.html";

});


// ========================================
// UPDATE PROFILE
// ========================================

const update_profile =
    document.getElementById("update_profile");

function update() {

    console.log("Hello Update");

    const userData =
        localStorage.getItem("user");

    if (!userData) {

        window.location.href =
            "/login.html";

        return;
    }

    const user =
        JSON.parse(userData);

    console.log("Logged user:", user);

    window.location.href =
        `student-profile.html?name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}`;
}

update_profile.addEventListener(
    "click",
    update
);