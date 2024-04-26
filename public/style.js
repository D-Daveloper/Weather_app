let time = document.getElementById("time")

setInterval(() => {
    let d = new Date();
    time.innerHTML = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
},1000)

let locationButton = document.querySelector(".location")

locationButton.addEventListener("click",() =>{
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                const data = { latitude, longitude };

                // Send location data to backend server
                fetch('/api/location', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                .then(response => {
                    if (response.ok) {
                        console.log("Location data sent successfully to server");   
                    } else {
                        console.error("Failed to send location data to server");
                    }
                })
                .catch(error => {
                    console.error("Error sending location data:", error);
                });
            },
            error => {
                console.error("Error getting geolocation:", error);
            }
        );
    } else {
        console.error("Geolocation is not supported by this browser");
    }
})