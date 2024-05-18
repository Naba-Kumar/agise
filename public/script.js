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


console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhuuuuuuuuuuuuuuuuuuuuuop");


// const formid = document.getElementById("registerForm");

// // Function to validate password match
// function validatePassword() {
//     var password = document.getElementById("password").value;
//     var rePassword = document.getElementById("re_password").value;
//     var errorSpan = document.getElementById("passwordError");

//     if (password !== rePassword) {
//         errorSpan.textContent = "Passwords do not match!";
//         alert('Passwords do not match!');

//         return false;
//     } else {
//         errorSpan.textContent = "";
//         return true;
//     }
// }


// function validateForm() {
//     for (var i = 0; i < formid.elements.length; i++) {
//         if (formid.elements[i].value === '' && formid.elements[i].hasAttribute('required')) {
//             alert('There are some required fields!');
//             return false;
//         }
//     }
//     return true;

// }



// formid.addEventListener("submit", function (event) {
//     validatePassword()
//     // Retrieve the value of the action input field
//     var action = document.getElementById("submit").value;
//     if (action === "Register") {
//         // Check if action is "register"

//         // if (!validateForm() || !validatePassword()) {
//             Swal.fire({
//                 title: 'Alert',
//                 text: "Password doesn't match",
//                 icon: 'danger'
//             });
//             event.preventDefault(); // Prevent form submission if passwords do not match
//         // }
    
//     }
// });

// document.getElementById('registerForm').addEventListener('submit', function (e) {
//     e.preventDefault(); // Prevent the default form submission

//     const formData = new FormData(this); // Create a FormData object from the form
//     const clickedButtonValue = e.submitter.value;
//     formData.append('submit', clickedButtonValue);
//     console.log(formData)

//     fetch('/', { // Send the FormData object to the "/" route
//         method: 'POST',
//         body: formData
//     })
//         .then(response => response.json())
//         .then(data => {
//             console.log(data);
//             if (data.success) {
//                 Swal.fire({
//                     title: 'Success!',
//                     text: data.message,
//                     icon: 'success'
//                 });
//             } // Handle the response data
//         })
//         .catch(error => {
//             console.error('Error:', error); // Handle any errors
//         });
// });





