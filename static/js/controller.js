function blockInput() {
    document.getElementById("btn_jump").disabled = !document.getElementById("btn_jump").disabled;
}

function getOS() {
    var userAgent = window.navigator.userAgent,
        platform = window.navigator.platform,
        iosPlatforms = ['iPhone', 'iPad', 'iPod'],
        os = null;

    if (iosPlatforms.indexOf(platform) !== -1) {
        os = 'iOS';
    }
    document.getElementById("messages").innerHTML = "Dispositivi IOS non supportati. <br>Usa il tasto Jump";
}

window.addEventListener("devicemotion", handleMotion, true);

function handleMotion(event) {
    var itd = getIsTouchingDown();
    var acc = event.acceleration.z;
    if (acc > 10 && itd) {
        jump();
    }

}

function requestPermission() {
    console.log("permession executed");
    if (typeof(DeviceMotionEvent) !== "undefined" && typeof(DeviceMotionEvent.requestPermission) === "function") {
        DeviceMotionEvent.requestPermission()
            .then(response => {
                if (response == "granted") {
                    window.addEventListener("devicemotion", (e) => {})
                }
            })
            .catch(error => {
                console.error(error);
                document.getElementById("messages").innerHTML = "Error: " + error.message;
            });
    } else {
        document.getElementById("messages").innerHTML = "DeviceMotionEvent is not defined"
    }
}