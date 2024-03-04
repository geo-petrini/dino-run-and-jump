// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyApE5ebUj8KaGFopZyUJpeRM0VlpHsQLDc",
    authDomain: "dino-run-and-jump-d4065.firebaseapp.com",
    databaseURL: "https://dino-run-and-jump-d4065-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "dino-run-and-jump-d4065",
    storageBucket: "dino-run-and-jump-d4065.appspot.com",
    messagingSenderId: "205261962038",
    appId: "1:205261962038:web:3d516a8a4080aa65b61197",
    measurementId: "G-GTFGZJF3QY"
  };


// Inizializzare Firebase
const app = firebase.initializeApp(firebaseConfig);

// Inizializzare database
const db = firebase.database();

// Inizializzare variabili
const auth = firebase.auth();
var timestamp = Date.now();
const user = firebase.auth().currentUser;
const nickname = "";
var code = 0;
var isTouchingDown = true;
var childNum;
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);

//#region bacheca.html
function writeMedals() {
    db.ref('user/' + localStorage.getItem("userUid") + "/medals").once('value', function (snapshot) {
        var elemento = document.getElementById("tabMedaglie");
        snapshot.forEach(function (childSnapshot) {
            elemento.innerHTML += '<svg width="120px" height="120px">' + childSnapshot.node_.children_.root_.value.value_ + '</svg>';
        });
    });
}

//#endregion

//#region collegamentoPartita.html

/**
 * La funzione connectToGame prende il codice della partita inserita dall'utente e se esiste lo aggiunge alla partita.
 * Ogni partita può avere al massimo 10 giocatori connessi.
 */

// TODO replace origin with event
// TODO refactor
function connectToGame(origin) {
    code = document.getElementById("code").value;
    localStorage.setItem('code', code);

    let destination = ''
    if (origin == 'player'){
        destination = 'player.html'
    }
    if (origin == 'arena'){
        destination = 'arena.html'
    }    

    db.ref('session/' + code + "/").once('value', function (snapshot) {
        childNum = snapshot.numChildren();
    });
    if (childNum < 11 && childNum != null && childNum != undefined) {
        if (firebase.auth().currentUser == null) {
            generateGuestId();
            console.log(`connecting user with guest id to db and session ${code}`)
            db.ref('session/').once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    if (code == childSnapshot.key) {
                        db.ref('session/' + childSnapshot.key + '/' + id).set({
                            is_jumping: false,
                            is_alive: true,
                            is_touchingDown: false,
                            score: 0,
                            dino_color: "0x000",
                        });
                        localStorage.setItem("sessionId", code);
                        window.open(destination, "_self");
                    }
                });
            });
            console.log( `session ${code} not found in db with guest user`)
        } else {
            id = firebase.auth().currentUser.uid;
            console.log(`connecting user ${id} to db and session ${code}`)
            db.ref('session/').once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    if (code == childSnapshot.key) {
                        db.ref('session/' + childSnapshot.key + '/' + id).set({
                            is_jumping: false,
                            is_alive: true,
                            is_touchingDown: false,
                            score: 0,
                        });
                        localStorage.setItem("sessionId", code);
                        window.open(destination, "_self");
                    }
                });
            });
            console.log( `session ${code} not found in db with logged user`)
        }
    } else if (childNum >= 10) {
        alert("Troppi giocatori (numero massimo: 10)");
    }
}

/**
 * La funzione generateGuestId crea un nome univoco per i giocatori che non haffo effettuato il login.
 * La stringa contiene un numero randomico di 6 cifre: 'guest_XXXXXX'.
 */
function generateGuestId() {
    id = "guest_" + Math.floor(100000 + Math.random() * 900000);
    localStorage.setItem('guestId', id);
}

//#endregion

//#region controller.html

/**
 * La funzione jump permette all'utente di far saltare il proprio dino modificando il valore di una variabile su Firebase.
 */
// TODO refactor
function jump() {
    db.ref('session/' + localStorage.getItem('code')).once('value', function (snapshot) {
        db.ref('session/').once('value', function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                childSnapshot.forEach(function (childChildSnapshot) {
                    console.log("jumpOut");
                    if (localStorage.getItem('guestId') == "null") {
                        if (firebase.auth().currentUser.uid != null && childChildSnapshot.key == firebase.auth().currentUser.uid) {
                            db.ref('session/' + childSnapshot.key + '/' + firebase.auth().currentUser.uid).update({
                                is_jumping: true,
                                score: childChildSnapshot.val().score,
                                is_alive: childChildSnapshot.val().is_alive,
                            });
                        }
                    } else if (localStorage.getItem('guestId') == childChildSnapshot.key) {
                        db.ref('session/' + childSnapshot.key + '/' + localStorage.getItem('guestId')).update({
                            is_jumping: true,
                            score: childChildSnapshot.val().score,
                            is_alive: childChildSnapshot.val().is_alive,
                            dino_color: childChildSnapshot.val().dino_color,
                        });
                    }
                });
            });
        });
    });
}

//#endregion

//#region player.html

/**
 * La funzione registerNewUser prende nickname e password inseriti dall'utente e con Firebase l'account viene creato.
 * Se Firebase restituisce un errore viene mostrato all'utente.
 */
function registerNewUser(nickname, password) {
    // var password = document.getElementById("password_signIn").value;
    // var nickname = document.getElementById("nickname_signIn").value;
    var email = nickname + "@dino.ch";

    // creare nuovo account
    auth.createUserWithEmailAndPassword(email, password)
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            document.getElementById('singIn_error').innerHTML = error.message;
        });
    console.log(firebase.auth().currentUser.uid);
    db.ref('user/' + firebase.auth().currentUser.uid).update({
        best_score: 0,
    })
}

/**
 * La funzione loginUser permette all'utente di autenticarsi con nickname e password.
 */
function loginUser(nickname, password) {
    // var password = document.getElementById("password_logIn").value;
    // var nickname = document.getElementById("nickname_logIn").value;
    var email = nickname + "@dino.ch";

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            nickname = firebase.auth().currentUser.email.split("@")[0];

            // document.getElementById("btn_logout").classList.remove("d-none");
            // document.getElementById("btn_account").classList.remove("d-none");
            // document.getElementById("btn_account").innerHTML == nickname;
            // document.getElementById("div_signin").style.display = "none";
            // document.getElementById("btn_login").style.display = "none";

            // localStorage.setItem('guestId', null);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            // document.getElementById('singIn_error').innerHTML = error.message;
            displayAlert(error.message);
        });
}

/**
 * La funzione logoutUser permette all'utente di disconnettersi dal proprio account.
 */
function logoutUser() {
    const nickname = firebase.auth().currentUser.email.split("@")[0];
    console.log(`logging out ${nickname}`);
    firebase.auth().signOut().then(function () {
        location.reload();
    });
}


/**
 * La funzione openUserInformation permette agli utenti di vedere e modificare le proprie informazioni.
 * Apre il file paginaUtente.html.
 */
function openUserInformation() {
    window.open("paginaUtente.html", "_self");

}

/**
 * La funzione generateSession genera un numero a 8 cifre randomico per identificare univocamente le sessioni.
 */
// TODO chk in db se la sessione esiste prima di salvarla
function generateSession() {
    id = Math.floor(100000 + Math.random() * 900000);
    localStorage.setItem("sessionId", id);
    db.ref("session/" + id).set({
        session_id: id,
    })
        .then(() => {
            window.open("controller.html", "_self");
        });
}

function getSessionId(){
    document.getElementById('sessionId').innerHTML = localStorage.getItem("sessionId");
}

// TODO implement check
function chkSessionId(code){
    // db.ref('session/' + code + "/").once('value', function (snapshot) {
    //     childNum = snapshot.numChildren();
    // });
}

//#endregion

//#region personalizzaDino.html

/**
 * La funzione changeDinoColor modifica il colore del dino in base al parametro indicato.
 * @param {*} color il nuovo colore per il dino
 */
function changeDinoColor(color) {
    document.getElementById('dino').style.fill = color;
}

/**
 * La funzione saveDinoColor registra il colore scelto dagli utenti che hanno effettuato il login.
 */
function saveDinoColor() {

    try {
        var idUsr = firebase.auth().currentUser.uid;
    } catch (error) {
        var idUsr = null;
    }
    color = document.getElementById('color_input').value;
    if (localStorage.getItem('guestId') != null && idUsr == null) {
        db.ref('session/').once('value', function (snapshot) {

            snapshot.forEach(function (childSnapshot) {
                if (localStorage.getItem("code") == childSnapshot.key) {
                    color = color.replace("#", "0x");
                    db.ref('session/' + childSnapshot.key + '/' + localStorage.getItem('guestId')).set({
                        is_jumping: false,
                        is_touchingDown: true,
                        is_alive: true,
                        score: 0,
                        dino_color: color,
                    });
                }
            });
        }).then(() => {
            window.open("game.html", "_self");
        });
    } else {
        color = color.replace("#", "0x");
        db.ref('user/' + firebase.auth().currentUser.uid).update({
            dino_color: color,
        }).then(() => {
            window.open("paginaUtente.html", "_self");
        });
    }
}

//#endregion

/**
 * La funzione showUserInformation dopo aver effettuato il login mostra le informazioni dell'utente e le opzioni non visibili ai guest.
 */
// TODO include guest
function showUserInformation() {
    document.getElementById('user').innerHTML = firebase.auth().currentUser.email.split("@")[0];

    db.ref('user/').once('value', function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            if (firebase.auth().currentUser.uid == childSnapshot.key) {
                var path = window.location.pathname;
                path = path.split("/");
                path = path[path.length - 1];
                var c = childSnapshot.val().dino_color.replace("0x", "#");

                if (path = "player.html") {
                    document.getElementById('color_input').value = c;
                    document.getElementById('dino').style.fill = c;
                }     
                          
            }
        });
    });
}

/**
 * Il listener viene chiamato alla modifica dello stato dell'autenticazione.
 * Serve per avere le informazioni di Firebase sugli utenti autenticati anche
 * dopo che si sono spostati dalla pagina principale del'applicazione.
 */
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        localStorage.setItem('guestId', null);
        localStorage.setItem("userUid", firebase.auth().currentUser.uid);
        var path = window.location.pathname;
        path = path.split("/");
        path = path[path.length - 1];
        //dino-run-and-jump/GUI%20telefono/paginaUtente.html
        if (path == "player.html") {
            document.getElementById("btn_logout").classList.remove("d-none");
            document.getElementById("btn_account").classList.remove("d-none");
            document.getElementById("btn_account").innerHTML += user.email.split("@")[0];
            document.getElementById("div_signin").style.display = "none";
            document.getElementById("btn_login").style.display = "none";

        } else if (path == "personalizzaDino.html") {
            showUserInformation();
            db.ref('user/').once('value', function (snapshot) {
                snapshot.forEach(function (childSnapshot) {
                    if (firebase.auth().currentUser.uid == childSnapshot.key) {
                        document.getElementById('dino').style.fill = childSnapshot.val().dino_color;
                        document.getElementById('color_input').value = childSnapshot.val().dino_color;
                    }
                });
            });

        } else if (path == "bacheca.html") {
            document.getElementById('username').innerHTML = firebase.auth().currentUser.email.split("@")[0];
        }
        db.ref('user/').once('value', function (snapshot) {
            if (!snapshot.child(firebase.auth().currentUser.uid).exists()) {
                db.ref('user/' + firebase.auth().currentUser.uid).set({
                    best_score: 0,
                    dino_color: "0x0",
                    nickname: firebase.auth().currentUser.email.split("@")[0],
                });
            }
        });
    }
});

/**
 * La funzione checkLoggedUser controlla se l'utente è autenticato e mostra alcune informazioni invisibili agli utenti guest.
 */
function checkLoggedUser() {
    document.getElementById('dino').style.fill = document.getElementById('color_input').value;
    if (localStorage.getItem('guestId') != null) {
        // document.getElementById("user_menu").style.display = "none";
    }
}

/**
 * La funzione isTouchingDown legge se il dino dell'utente corrente sta toccando a terra o meno
 * @returns is_touching down
 */
function getIsTouchingDown() {

    if (localStorage.getItem("guestId") == "null") {
        db.ref('session/' + localStorage.getItem("code") + "/" + firebase.auth().currentUser.uid).once('value', function (snapshot) {
            isTouchingDown = snapshot.val().is_touchingDown;

        });
    } else {
        db.ref('session/' + localStorage.getItem("code") + "/" + localStorage.getItem("guestId")).once('value', function (snapshot) {
            isTouchingDown = snapshot.val().is_touchingDown;

        });
    }

    return isTouchingDown;
}

function copyToClipboard(clicked) {
    // Ottieni l'ID dell'elemento cliccato
    var id = clicked.id;

    var textToCopy = document.getElementById(id);

    // Crea un campo di input temporaneo
    var tempInput = document.createElement('input');
    tempInput.value = textToCopy.textContent;

    // Aggiungi il campo di input alla pagina
    document.body.appendChild(tempInput);

    // Seleziona il testo nel campo di input
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // Per dispositivi mobili

    // Copia il testo negli appunti
    document.execCommand('copy');

    // Rimuovi il campo di input temporaneo
    document.body.removeChild(tempInput);

    // Aggiungi un feedback visivo (opzionale)
    alert('Testo copiato negli appunti: ' + textToCopy.textContent);
}