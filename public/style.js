let time = document.getElementById("time")

setInterval(() => {
    let d = new Date();
    time.innerHTML = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
},1000)
