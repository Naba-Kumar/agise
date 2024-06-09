// const nav = document.querySelector('.sidebar-nav').querySelectorAll('li');

// console.log(nav)

// nav.forEach(elements => {
//     elements.addEventListener("click", function(){
//         nav.forEach(nav => nav.classList.remove("active"))
//         console.log(this.classList)
//         this.classList.add("active")
//     })
// })


document.addEventListener("DOMContentLoaded", function() {
    const nav = document.querySelector('.sidebar-nav');

    nav.addEventListener("click", function(event) {
        const target = event.target;
        
        if (target.tagName === 'li') {
            nav.querySelectorAll('li').forEach(li => li.classList.remove("active"));
            target.classList.add("active");
        }
    });
});
