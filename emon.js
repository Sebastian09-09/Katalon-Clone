console.log("Popup script is running!");
localStorage.setItem('selectedRep', 'null');
let suitesVal = localStorage.getItem('suites');
if (suitesVal == null){
    suites = []
}else{
    suites = JSON.parse(suitesVal)
}
console.log(suites)

for (const suite of suites){
    document.getElementById('suitesList').innerHTML += `<div class="suite" id='${suite}' style="display : flex;flex-direction: row;justify-content: space-between;"><span class='suiteName' data-value='${suite}' style='width: 100%'>${suite}</span> <span class='deleteSuite' data-value='${suite}'>

    <svg data-value='${suite}' xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
    </svg>

    </span></div>`
}

let selectedVal = localStorage.getItem('selected');
if (selectedVal == null){
    localStorage.setItem('selected' , 'null');
    selectedVal = 'null'
}
if (selectedVal == 'null'){
    selected = null;
    document.getElementById('settings').style.display = 'none';
    document.getElementById('settings').dataset.value = 'off';
    //document.getElementById('settings').dataset.action = 'stop';
    //document.getElementById('stop').disabled = true;
}else{
    selected = selectedVal;
    document.getElementById(selected).style.backgroundColor = 'lightgreen';
    document.getElementById(selected).dataset.value = 'selected';
    document.getElementById(selected).getElementsByClassName('deleteSuite')[0].style.display = 'none';
    const stepsArray = JSON.parse(localStorage.getItem(selected));
    if (stepsArray){
        for (const data of stepsArray){
            document.getElementById('tableLogs').innerHTML += `<tr><td>${data.event}</td><td>${data.xpath}</td>${data.value !== undefined ? `<td>${data.value}</td>` : ''}</tr>`;
        }
    }
    //document.getElementById('settings').dataset.action = 'stop';
    //document.getElementById('stop').disabled = true;
}
console.log(selected)

document.getElementById('newSuite').addEventListener('submit' , function (){
    let value = document.getElementById('suiteInput').value.trim();
    if ((value) && !(suites.includes(value))){
        suites.push(value)
        localStorage.setItem("suites", JSON.stringify(suites) );
        localStorage.setItem(value, JSON.stringify([]))
    }
} )

const suiteNames = document.getElementsByClassName('suiteName')

console.log(suiteNames)

Array.from(suiteNames).forEach(dsuite => {
    dsuite.addEventListener('click' , function (elem){
        const suiteName = elem.target.dataset.value;
        const clickedSuite = document.getElementById(suiteName);

        if (clickedSuite.dataset.value != 'selected' && localStorage.getItem('selected') == 'null' ){
            clickedSuite.style.backgroundColor = 'lightgreen';
            clickedSuite.dataset.value = 'selected';
            clickedSuite.getElementsByClassName('deleteSuite')[0].style.display = 'none';
            document.getElementById('settings').style.display = 'block';
            document.getElementById('settings').dataset.value = 'on';
            localStorage.setItem('selected', suiteName);
            const stepsArray = JSON.parse(localStorage.getItem(suiteName));
            if (stepsArray){
                for (const data of stepsArray){
                    document.getElementById('tableLogs').innerHTML += `<tr><td>${data.event}</td><td>${data.xpath}</td>${data.value !== undefined ? `<td>${data.value}</td>` : ''}</tr>`;
                }
            }

            //localStorage.setItem('action', 'record')
            //document.getElementById('stop').disabled = false;
            //document.getElementById('record').disabled = true;
        }else if(suiteName == localStorage.getItem('selected')){
            clickedSuite.style.backgroundColor = 'lightgrey';
            clickedSuite.dataset.value = null;
            localStorage.setItem('selected', null);
            clickedSuite.getElementsByClassName('deleteSuite')[0].style.display = 'inline';
            document.getElementById('settings').style.display = 'none';
            document.getElementById('settings').dataset.value = 'off';
            document.getElementById('tableLogs').innerHTML = '<tr><th width="25%">Event</th><th width="50%">Path</th><th width="25%">Input</th></tr>';
            //localStorage.setItem('action', 'stop')
            //document.getElementById('stop').disabled = true;
            //document.getElementById('record').disabled = false;
        }
    }) 
});

const deleteSuites = document.getElementsByClassName('deleteSuite')

console.log(deleteSuites)

Array.from(deleteSuites).forEach(dsuite => {
    dsuite.addEventListener('click' , function (elem){
        console.log(elem.target.dataset.value);
        let suitesVal = localStorage.getItem('suites');
        let suites = JSON.parse(suitesVal);
        const index = suites.indexOf(elem.target.dataset.value);
        suites.splice(index,1);
        localStorage.setItem("suites", JSON.stringify(suites) );
        localStorage.removeItem(elem.target.dataset.value);
        location.reload();
    }) 
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if ((message.type === "logEvent") && (document.getElementById('settings').dataset.value == 'on')) {

        document.getElementById('tableLogs').innerHTML += `<tr><td>${message.data.eventType}</td><td>${message.data.xpath}</td>${message.data.value !== undefined ? `<td>${message.data.value}</td>` : ''}</tr>`;

        let steps = JSON.parse(localStorage.getItem(localStorage.getItem('selected')))
      const step = {
        event: message.data.eventType,
        xpath: message.data.xpath,
        value: message.data.value ,
        page: message.data.page
      };
      steps.push(step)
      localStorage.setItem(localStorage.getItem('selected'), JSON.stringify(steps));
    }
});


/*
document.getElementById('record').addEventListener('click' , function (elem){

    localStorage.setItem('action', 'record')
    document.getElementById('stop').disabled = false;
    document.getElementById('record').disabled = true;
})

document.getElementById('stop').addEventListener('click' , function (elem){
    
    localStorage.setItem('action', 'stop')
    document.getElementById('stop').disabled = true;
    document.getElementById('record').disabled = false;

})*/