    const renderDeploymentURl  ="https://slidoapp.onrender.com";
    const loginDeployedUrl = `${renderDeploymentURl}/user/login`
    // let localurl = "http://localhost:8080/user/login"
    


let form = document.querySelector('form')
form.addEventListener('submit', myfun)
function myfun(event) {
    event.preventDefault()
    let email = document.getElementById("email").value
    let password = document.getElementById("password").value

    if (!email || !password) {
        alert("Please enter your email and password")
    } else {

        const payload = { email, password }
        // console.log("🚀 ~ file: login.js:15 ~ myfun ~ payload:", payload)

        fetch(loginDeployedUrl, {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(payload)

        }).then((res) => {
            return res.json()
        })
            .then((res) => {
                console.log(res)
                if (res.token) {
                    localStorage.setItem("userObject", JSON.stringify(res))
                    setTimeout(() => {
                        swal("Yeah!", "User has been logged in!", "success");
                    }, 200);
                    setTimeout(() => {
                        window.location.href = "./eventPage.html";
                    }, 1000);
                }
                else {
                    setTimeout(() => {
                        swal("oops!", "Incorrect username or password!", "error");
                    }, 200);
                }
            })
            .catch((err) => {
                console.log(err.message);
            })


    }

}


