

function chkAlertNavbarExists() {
    if (document.getElementById("alerts") != null) {
        return true
    } else {
        console.log('alert navbar not present')
        return false
    }
}

function addAlertNavbar() {
    console.log('adding alert navbar')
    let newbar = `<nav id="alerts" class="navbar fixed-bottom navbar-light bg-light" style="z-index: 9000;position: fixed;"></nav>`
    document.body.innerHTML += newbar;
}

function displayAlert(message, level = "danger") {
    if (!chkAlertNavbarExists()) {
        addAlertNavbar()
    }

    let newAlert = `<div class="alert alert-${level}" alert-dismissible fade show" role="alert" >
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
        ${message}
    </div>`

    document.getElementById("alerts").innerHTML += newAlert
}

