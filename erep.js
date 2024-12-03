console.log("Popup script is running!");
localStorage.setItem('selected', 'null');
let suitesVal = localStorage.getItem('suites');
if (suitesVal == null){
    suites = []
}else{
    suites = JSON.parse(suitesVal)
}
console.log(suites)

for (const suite of suites){
    document.getElementById('suitesList').innerHTML += `<div class="suite" id='${suite}' style="display : flex;flex-direction: row;justify-content: space-between;"><span class='suiteName' data-value='${suite}' style='width: 100%'>${suite}</span> </div>`
}

let selectedValRep = localStorage.getItem('selectedRep');
if (selectedValRep == null){
    localStorage.setItem('selectedRep' , 'null');
    selectedValRep = 'null'
}
let selectedRep;
if (selectedValRep == 'null'){
    selectedRep = null;
    document.getElementById('settings').style.display = 'none';
    document.getElementById('settings').dataset.value = 'off';
    //document.getElementById('settings').dataset.action = 'stop';
    //document.getElementById('stop').disabled = true;
}else{
    selectedRep = selectedValRep;
    document.getElementById(selectedRep).style.backgroundColor = 'lightgreen';
    document.getElementById(selectedRep).dataset.value = 'selectedRep';
    const stepsArray = JSON.parse(localStorage.getItem(selectedRep));
    if (stepsArray){
        for (const data of stepsArray){
            document.getElementById('tableLogs').innerHTML += `<tr><td>${data.event}</td><td>${data.xpath}</td>${data.value !== undefined ? `<td>${data.value}</td>` : ''}</tr>`;
        }
    }
    //document.getElementById('settings').dataset.action = 'stop';
    //document.getElementById('stop').disabled = true;
}
console.log(selectedRep)

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

        if (clickedSuite.dataset.value != 'selectedRep' && localStorage.getItem('selectedRep') == 'null' ){
            clickedSuite.style.backgroundColor = 'lightgreen';
            clickedSuite.dataset.value = 'selectedRep';
            document.getElementById('settings').style.display = 'block';
            document.getElementById('settings').dataset.value = 'on';
            localStorage.setItem('selectedRep', suiteName);
            const stepsArray = JSON.parse(localStorage.getItem(suiteName));
            if (stepsArray){
                for (const data of stepsArray){
                    document.getElementById('tableLogs').innerHTML += `<tr><td>${data.event}</td><td>${data.xpath}</td>${data.value !== undefined ? `<td>${data.value}</td>` : ''}</tr>`;
                }
            }

            //localStorage.setItem('action', 'record')
            //document.getElementById('stop').disabled = false;
            //document.getElementById('record').disabled = true;
        }else if(suiteName == localStorage.getItem('selectedRep')){
            clickedSuite.style.backgroundColor = 'lightgrey';
            clickedSuite.dataset.value = null;
            localStorage.setItem('selectedRep', null);
            document.getElementById('settings').style.display = 'none';
            document.getElementById('settings').dataset.value = 'off';
            document.getElementById('tableLogs').innerHTML = '<thead><tr><th width="25%">Event</th><th width="50%">Path</th><th width="25%">Input</th></tr></thead>';
            //localStorage.setItem('action', 'stop')
            //document.getElementById('stop').disabled = true;
            //document.getElementById('record').disabled = false;
        }
    }) 
});

let steps = []
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if ((message.type === "___") && (document.getElementById('settings').dataset.value == 'on')) {

    }
});

//Clicking Start
document.getElementById('start').addEventListener('click' , async function (){
    let passed = true;
    document.getElementById('start').disabled = true;
    document.getElementById('stop').disabled = false;
    selectedRep = localStorage.getItem('selectedRep');
    steps = document.querySelectorAll('tbody');
    for (const step of steps){
        console.log(step)

        step.style.backgroundColor = 'lightblue'
        
        let response = await new Promise(function(myResolve,myReject){
            chrome.tabs.query({ active: true, currentWindow: false }, async (tabs) => {
                console.log(tabs[0])
                if ( step.querySelectorAll('td')[2] ){
                    responseFromContentJS = await chrome.tabs.sendMessage(tabs[0].id, { type: 'runStep', data: {'event':step.querySelectorAll('td')[0].textContent , 'path': step.querySelectorAll('td')[1].textContent , 'value': step.querySelectorAll('td')[2].textContent} });
                }else{
                    responseFromContentJS = await chrome.tabs.sendMessage(tabs[0].id, { type: 'runStep', data: {'event':step.querySelectorAll('td')[0].textContent , 'path': step.querySelectorAll('td')[1].textContent , 'value': undefined} });
                }
                await sleep(Number(document.getElementById('delay').value)*1000);
                myResolve(responseFromContentJS);
            });
        });

        console.log(response);
        if(response == true){
            step.style.backgroundColor = 'lightgreen';
        }else{
            passed = false
            step.style.backgroundColor = 'lightpink';
            document.getElementById('output').innerHTML += `${response} <hr>`
        }
        
    }

    console.log('Completed!')
    document.getElementById('output').innerHTML += `${(passed ? 'Passed &#9989;' : 'Failed &#10062;')} <hr>`
    document.getElementById('stop').textContent = 'Clear';
})


//Clicking Start
document.getElementById('stop').addEventListener('click' , function (){
    window.location.reload();
})


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/*
//Export CSV
document.getElementById("exportCSV").addEventListener("click", function () {
    // Data to be included in the CSV
    const localData = JSON.parse(localStorage.getItem(localStorage.getItem('selectedRep')))
    const headers = []
    const values = []
    for (const step of localData){
        console.log(step)
        headers.push(step.event)
        values.push(step.value)
    }

    
    const data = [
        headers,  // Header row
        values
    ];

    //console.log(data)

    // Convert array data to CSV string
    const csvContent = data.map(row => row.join(",")).join("\n");

    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: "text/csv" });

    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${localStorage.getItem('selectedRep')}.csv`; // File name
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});
*/