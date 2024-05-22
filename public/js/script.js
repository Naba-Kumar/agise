
// 1st fetch api

function formDataToObject(formData) {
    const obj = {};
    formData.forEach((value, key) => {
        obj[key] = value;
    });
    return obj;
}

// Generic function to handle form submissions
const handleFormSubmit = async(event, url)=> {
    event.preventDefault(); // Prevent the default form submission

    const formData = new FormData(event.target); // Create a FormData object from the form
    const clickedButtonValue = event.submitter.value;
    formData.append('submit', clickedButtonValue);
    
    const formDataObj = formDataToObject(formData); // Convert FormData to an object for logging
    console.log('Submitting to URL:', url, 'with data:', formDataObj);

    await fetch(url, {
        method: 'POST',
        redirect: 'follow',
        body: formData,
    })
    .then(response => response.json())

    .then(data => {
        console.log('Response data:', data);
        if (data) {
            Swal.fire({
                title: data.title,
                text: data.message,
                confirmButtonText: "OK",

                icon: data.icon
            }).then((result) => {
                    /* Read more about isConfirmed, isDenied below */
                    if (result.isConfirmed) {
                        if(data.redirect != undefined){
                            window.location.href = data.redirect; // Replace with your desired URL
                        }
                    } 
                  });

         
            
        } else {
            console.error('Unexpected response format:', data);
            Swal.fire({
                title: 'Error',
                text: 'Unexpected response format.',
                icon: 'error'
            });
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
        Swal.fire({
            title: 'Error',
            text: `An error occurred: ${error.message}`,
            icon: 'error'
        });
    });
}

// Attach event listeners to each form, passing the appropriate endpoint URL
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            handleFormSubmit(e, '/user/login');
        });
    }

    const forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', function(e) {
            handleFormSubmit(e, '/user/forgot');
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            handleFormSubmit(e, '/user');
        });
    }
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(e) {
            handleFormSubmit(e, '/admin');
        });
    }
  
});

// 2nd fetch api

function handleAdminLogout (event, url) {
    event.preventDefault(); // Prevent the default form submission


    fetch(url, { // Send the FormData object to the specified route
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data) {
            Swal.fire({
                title: data.title,
                text: data.message,
                confirmButtonText: "OK",

                icon: data.icon
            }).then((result) => {
                    /* Read more about isConfirmed, isDenied below */
                    if (result.isConfirmed) {
                        if(data.redirect != undefined){
                            window.location.href = data.redirect; // Replace with your desired URL
                        }
                    } 
                  });
        } // Handle the response data
    })
    .catch(error => {
        console.error('Error:', error); // Handle any errors
    });
}

// Attach event listeners to each form, passing the appropriate endpoint URL
document.getElementById('adminLogout').addEventListener('click', function(e) {
    handleAdminLogout (e, '/admin/logout');
});




    // const sidebarToggle = document.querySelector("#sidebar-toggle");
    // sidebarToggle.addEventListener("click", function () {
    //     document.querySelector("#sidebar").classList.toggle("collapsed");
    // });
    
    // document.querySelector(".theme-toggle").addEventListener("click", () => {
    //     toggleLocalStorage();
    //     toggleRootClass();
    // });
    
    // function toggleRootClass() {
    //     const current = document.documentElement.getAttribute('data-bs-theme');
    //     const inverted = current == 'dark' ? 'light' : 'dark';
    //     document.documentElement.setAttribute('data-bs-theme', inverted);
    // }
    
    
    console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhuuuuuuuuuuuuuuuuuuuuuop");
    // function toggleLocalStorage() {
    //     if (isLight()) {
    //         localStorage.removeItem("light");
    //     } else {
    //         localStorage.setItem("light", "set");
    //     }
    // }
    
    // function isLight() {
    //     return localStorage.getItem("light");
    // }
    
    // if (isLight()) {
    //     toggleRootClass();
    // }
    
    
    
    
        // Generic function to handle form submissions
    // Function to convert FormData to an object for better logging