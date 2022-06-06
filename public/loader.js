let pathSplit = window.location.pathname.split("/");
if (pathSplit[1] == "game") {
    (async () => {
        console.log(await (await fetch(`/session/${pathSplit[2]}/battlemap`)).json());
    })();
}