var alertTimeouts = [];

function chkAlertContainerExists() {
    if (document.getElementById("alerts") != null) {
        return true
    } else {
        // console.log('alert navbar not present')
        return false
    }
}

function addAlertContainer() {
    // console.log('adding alert container')
    let ct = `
    <div id="alerts" class="fixed-bottom" style="z-index: 9000;position: fixed;">
        <ul id="alerts-list" class="list-group list-group-flush"></ul>
    </div>`
    document.body.innerHTML += ct;
}


function createProgressBar() {
    const progressBar = document.createElement("div");
    progressBar.classList.add("progress");
    progressBar.style.height = "1px";
    // progressBar.style.direction = "rtl"; // TODO check if it works with bootstrap 5
    progressBar.innerHTML = `
        <div class="progress-bar bg-dark" role="progressbar" style="width: 100%;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
    `;
    return progressBar;
}

function updateProgressBar(progressBar, progress) {
    progressBar.style.width = `${progress}%`;
}

function startProgressBarInterval(progressBar, newAlert, timeoutId) {
    let progress = 100;
    return setInterval(() => {
        progress -= (50 / 3000) * 100;
        updateProgressBar(progressBar, progress);

        if (progress <= 0) {
            clearInterval(intervalId);
            removeAlert(newAlert);
            alertTimeouts = alertTimeouts.filter(id => id !== timeoutId);
        }
    }, 50);
}

function removeAlert(alertElement) {
    alertElement.remove();
}

function displayAlert(message, level = "danger") {
    if (!chkAlertContainerExists()) {
        addAlertContainer()
    }

    let newAlert = document.createElement("li");
    newAlert.classList.add("list-group-item", "alert", `alert-${level}`, "alert-dismissible");
    newAlert.innerHTML = `
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
        ${message}
    `;    

    const alertsContainer = document.getElementById("alerts");
    alertsContainer.appendChild(newAlert);

    const progressBar = createProgressBar();
    newAlert.appendChild(progressBar);    

    const lastAlert = alertsContainer.querySelector('.list-group-item:last-child');

    let intervalId = null;
    // Rimuovi il messaggio dopo 3 secondi
    const timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        removeAlert(lastAlert);
        // Rimuovi il timeout dalla lista
        alertTimeouts = alertTimeouts.filter(id => id !== timeoutId);
        // console.log(alertTimeouts)
    }, 3000);

    intervalId = startProgressBarInterval(progressBar, newAlert, timeoutId);
    // Aggiungi l'ID del timeout alla lista
    alertTimeouts.push(timeoutId); 
    // console.log(alertTimeouts)
}

