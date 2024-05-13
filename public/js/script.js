const sidebarToggle = document.querySelector("#sidebar-toggle");
sidebarToggle.addEventListener("click", function () {
    document.querySelector("#sidebar").classList.toggle("collapsed");
});

document.querySelector(".theme-toggle").addEventListener("click", () => {
    toggleLocalStorage();
    toggleRootClass();
});

function toggleRootClass() {
    const current = document.documentElement.getAttribute('data-bs-theme');
    const inverted = current == 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-bs-theme', inverted);
}

function toggleLocalStorage() {
    if (isLight()) {
        localStorage.removeItem("light");
    } else {
        localStorage.setItem("light", "set");
    }
}

function isLight() {
    return localStorage.getItem("light");
}

if (isLight()) {
    toggleRootClass();
}




const formid = document.getElementById("registerForm");

// Function to validate password match
function validatePassword() {
    var password = document.getElementById("password").value;
    var rePassword = document.getElementById("re_password").value;
    var errorSpan = document.getElementById("passwordError");

    if (password !== rePassword) {
        errorSpan.textContent = "Passwords do not match!";
        alert('Passwords do not match!');

        return false;
    } else {
        errorSpan.textContent = "";
        return true;
    }
}


function validateForm() {
    for (var i = 0; i < formid.elements.length; i++) {
        if (formid.elements[i].value === '' && formid.elements[i].hasAttribute('required')) {
            alert('There are some required fields!');
            return false;
        }
    }
    return true;

}



formid.addEventListener("submit", function (event) {
    // Retrieve the value of the action input field
    var action = document.getElementById("action").value;
    if (action === "Register") {
        // Check if action is "register"

        if (!validateForm() || !validatePassword()) {
            event.preventDefault(); // Prevent form submission if passwords do not match
        }
    
    }
});





console.log("alertttttttttttt")
for (var i = 0; i < formid.elements.length; i++) {
    if (formid.elements[i].value === '' && formid.elements[i].hasAttribute('required')) {
        alert('There are some required fields!');
        return false;
    }
}