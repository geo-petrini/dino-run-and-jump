const MAX_PLAYERS = 10
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


/** la funzione prende come argomento il codice sessione di una partita e verifica il numero di giocatori*/
async function _canConnectToGame(code) {

    try {
        let result = await db.ref(`session/${code}/`).once('value')
            .then(function (snapshot) {
                childNum = snapshot.numChildren();
                console.log(`session ${code} players count ${childNum}`)
                if (childNum <= MAX_PLAYERS && childNum != null && childNum != undefined) {
                    return true;
                } else {
                    return false;
                }
            });
    } catch (error) {
        console.error(error);
        displayAlert("Error: " + error.message);
        return false
    }

    // db.ref(`session/${code}/`).once('value')
    //     .then(function (snapshot) {
    //         childNum = snapshot.numChildren();
    //         console.log(`session ${code} players count ${childNum}`)
    //         if (childNum <= MAX_PLAYERS && childNum != null && childNum != undefined) {
    //             return true;
    //         } else {
    //             return false;
    //         }
    //     })
    //     .catch(error => {
    //         console.error(error);
    //         displayAlert("Error: " + error.message);
    //         return false
    //     });
}

function _addPlayerToSession(playerid, code) {
    console.log(`connecting user with id ${playerid} to db and session ${code}`)
    if (playerid == null || playerid == 'null') {
        displayAlert("Invalid user, either login or get a guest account")
        return false
    }

    if (code == null || code == 'null') {
        displayAlert("Invalid session code, connect to a game session")
        return false
    }

    let playerKey = `session/${code}/${playerid}`
    let playerObj = {
        is_jumping: false,
        is_alive: true,
        is_touchingDown: false,
        score: 0
    }
    //add dino_color for guest players
    if (playerid.startsWith("guest_")) {
        playerObj['dino_color'] = "0x000";
    }

    db.ref('session/').once('value')
        .then(function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                if (code == childSnapshot.key) {
                    db.ref(playerKey).set(playerObj);
                    // localStorage.setItem("sessionId", code);
                    // window.open(destination, "_self");
                }
            });
        })
        .catch(error => {
            console.error(error);
            displayAlert("Error: " + error.message);
        });
}

/**
 * sets localStorage "code" value by reading it from document.getElementById("code").value or by the give parameter
 */
function setSessionCode(inputCode = null) {
    let code = inputCode
    if (inputCode == null) {
        code = document.getElementById("code").value;
    }

    localStorage.setItem('code', code);
    console.log(`setting session code to ${code} from ${inputCode}`)
    return code;
}
/**
 * La funzione connectToGame prende il codice della partita inserita dall'utente e se esiste lo aggiunge alla partita.
 * Ogni partita può avere al massimo 10 giocatori connessi.
 */

// TODO add origin so that connection is possible also from the arena
function connectToGame(code = null) {
    code = setSessionCode(code)
    let playerid = getPlayerId()

    if (playerid == null || playerid == 'null') {
        displayAlert("Invalid user, either login or get a guest account")
        return false
    }

    if (code == null || code == 'null') {
        displayAlert("Invalid session code, connect to a game session")
        return false
    }

    //async stuff going on here
    if (_canConnectToGame(code)) {
        _addPlayerToSession(playerid, code)
    } else {
        displayAlert("Troppi giocatori nella sessione")
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
    db.ref(`session/${localStorage.getItem('code')}`).once('value')
        .then(function (dataSnapshot) {
            console.log(`session: ${localStorage.getItem('code')}, dataSnapshot: ${JSON.stringify(dataSnapshot.exportVal())}`)
        })
}

// function jump() {
//     db.ref(`session/${localStorage.getItem('code')}`).once('value', function (snapshot) {
//         db.ref('session/').once('value', function (snapshot) {
//             console.log(`processing session: ${snapshot}`)
//             snapshot.forEach(function (childSnapshot) {
//                 childSnapshot.forEach(function (childChildSnapshot) {
//                     // console.log("jumpOut");

//                     let playerId = null
//                     // if (localStorage.getItem('guestId') == "null" || localStorage.getItem('guestId') == null ) {

//                     if (localStorage.getItem('guestId') != null
//                         && firebase.auth().currentUser != null
//                         && firebase.auth().currentUser.uid != null
//                         && childChildSnapshot.key == firebase.auth().currentUser.uid) {
//                         // player is this registered user
//                         playerId = firebase.auth().currentUser.uid
//                     } else if (childChildSnapshot.key == localStorage.getItem('guestId')) {
//                         // player is a guest
//                         playerId = localStorage.getItem('guestId')
//                     }

//                     const playerRef = db.ref(`session/${childSnapshot.key}/${playerId}`)

//                     playerRef.update({
//                         is_jumping: true,
//                         score: childChildSnapshot.val().score,
//                         is_alive: childChildSnapshot.val().is_alive,
//                         // dino_color: childChildSnapshot.val().dino_color, // check if update dino_color for guests is necessary (not needed for registered players)
//                     }).catch((error) => {
//                         console.log(`error jumping player ${playerId}`, error)
//                         displayAlert(`error jumping player ${playerId}: ${error}`)
//                     });

//                 });
//             });
//         });
//     });
// }

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
    console.log(`trying to log in with ${email}`)

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
    // window.open("paginaUtente.html", "_self");

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
            // window.open("controller.html", "_self");
        });
}

function getSessionId() {
    chkSessionId(localStorage.getItem("sessionId"))
    document.getElementById('sessionId').innerHTML = localStorage.getItem("sessionId");
}

// TODO implement check
function chkSessionId(code) {
    if (code != null) {
        sessionRef = db.ref(`session/${code}/`)

        sessionRef.get().then((doc) => {
            if (doc.exists) {
                console.log(`session with code ${code} exists`)
            } else {
                console.log(`session with code ${code} does not exists`)
                localStorage.removeItem("sessionId")
            }
        }).catch((error) => {
            console.log(`error getting document for session ${code}`, error)
        })
    }
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

function getPlayerId() {

    let playerId = null
    if (firebase.auth().currentUser != null && firebase.auth().currentUser.uid != null) {
        // player is this registered user
        playerId = firebase.auth().currentUser.uid
    } else if (localStorage.getItem('guestId') != null) {
        // player is a guest
        playerId = localStorage.getItem('guestId')
    }
    return playerId
}
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

function updateUserInfo() {
    let guestId = localStorage.getItem('guestId');
    let user = firebase.auth().currentUser;
    console.log(`guestId: ${guestId}`)
    console.log(`user: ${user}`)
    if ((guestId != null && guestId != "null") || (user != null && user != "null")) {

        document.getElementById("div_signin").style.display = "none";   //hide sign in button
        document.getElementById("btn_account").classList.remove("d-none");  //display user account button
        if (user != null) {
            document.getElementById("btn_login").style.display = "none";    //hide login button
            document.getElementById("btn_logout").classList.remove("d-none");   //display logout button
            document.getElementById("btn_account").innerHTML = user.email.split("@")[0];    //write user name in account button
        }
        else if (guestId != null) {
            // console.log(`guestid: ${guestId}`)
            document.getElementById("btn_account").innerHTML = guestId;
        }
    } else {
        document.getElementById("div_signin").style.display = "true";   //show sign in button
        document.getElementById("btn_login").style.display = "true";    //show login button
        document.getElementById("btn_account").classList.add("d-none");  //hide user account button
        document.getElementById("btn_account").innerHTML = "";
        document.getElementById("btn_logout").classList.add("d-none");   //hide logout button
    }
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
            updateUserInfo()
        }
        // } else if (path == "personalizzaDino.html") {
        //     showUserInformation();
        //     db.ref('user/').once('value', function (snapshot) {
        //         snapshot.forEach(function (childSnapshot) {
        //             if (firebase.auth().currentUser.uid == childSnapshot.key) {
        //                 document.getElementById('dino').style.fill = childSnapshot.val().dino_color;
        //                 document.getElementById('color_input').value = childSnapshot.val().dino_color;
        //             }
        //         });
        //     });

        // } else if (path == "bacheca.html") {
        //     document.getElementById('username').innerHTML = firebase.auth().currentUser.email.split("@")[0];
        // }
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