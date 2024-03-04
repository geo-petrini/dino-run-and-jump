var alertTimeouts = [];

function chkAlertContainerExists() {
    if (document.getElementById("alerts") != null) {
        return true
    } else {
        console.log('alert navbar not present')
        return false
    }
}

function addAlertContainer() {
    console.log('adding alert container')
    let ct = `
    <div id="alerts" class="fixed-bottom" style="z-index: 9000;position: fixed;">
        <ul id="alerts-list" class="list-group list-group-flush"></ul>
    </div>`
    document.body.innerHTML += ct;
}

function removeAlert(alertElement) {
    alertElement.remove();

}

function displayAlert(message, level = "danger") {
    if (!chkAlertContainerExists()) {
        addAlertContainer()
    }

    // let newAlert = `
    // <li class="list-group-item alert alert-${level}" alert-dismissible fade show" role="alert" >
    //     <button type="button" class="close" data-dismiss="alert" aria-label="Close">
    //         <span aria-hidden="true">&times;</span>
    //     </button>
    //     ${message}
    // </li>`
    let newAlert = document.createElement("li");
    newAlert.classList.add("list-group-item", "alert", `alert-${level}`);
    newAlert.innerHTML = `
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
        ${message}
    `;    

    const alertsContainer = document.getElementById("alerts");
    // alertsContainer.innerHTML += newAlert;
    alertsContainer.appendChild(newAlert);

    // const lastAlert = alertsContainer.lastElementChild;
    const lastAlert = alertsContainer.querySelector('.list-group-item:last-child');

    // Rimuovi il messaggio dopo 3 secondi
    const timeoutId = setTimeout(() => {
        removeAlert(lastAlert);
        // Rimuovi il timeout dalla lista
        alertTimeouts = alertTimeouts.filter(id => id !== timeoutId);
        console.log(alertTimeouts)
    }, 3000);

    // Aggiungi l'ID del timeout alla lista
    alertTimeouts.push(timeoutId); 
    console.log(alertTimeouts)
}

