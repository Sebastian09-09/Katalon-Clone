console.log("Content script is running!");


function logEvent(eventType, xpath, value, page) {
    chrome.runtime.sendMessage({
        type: "logEvent",
        data: {eventType, xpath , value, page}
    });
}

// Function to generate the XPath of an element
function getElementXPath(element) {
    if (element.id) {
        return '//*[@id="' + element.id + '"]';  // If the element has an ID, use it directly.
    }

    let path = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
        let index = 1;
        let sibling = element.previousSibling;

        // Find the position of the element among its siblings with the same tag name.
        while (sibling) {
            if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === element.nodeName) {
                index++;
            }
            sibling = sibling.previousSibling;
        }

        // Add the element's node name and index to the path
        path.unshift(element.nodeName.toLowerCase() + '[' + index + ']');
        element = element.parentNode;  // Move up to the parent element
    }

    return path.length ? '/' + path.join('/') : null;  // Join the parts to form the full XPath.
}



// Monitor clicks
document.body.addEventListener("click", (event) => {
    const targetElement = event.target;
    const value = event.target.value;
    const xpath = getElementXPath(targetElement);
    const page = event.srcElement.baseURI;
    logEvent("click", xpath, value, page);
});

//Link Clicks
/*
const a = document.querySelectorAll('a')

a.forEach(input => {
    input.addEventListener("click", (event) => {
        const targetElement = event.target;
        const value = event.target.value;
        const xpath = getElementXPath(targetElement);
        const page = event.srcElement.baseURI;
        logEvent("click", xpath, value, page);
    });
});
*/

//Inputs
const inputs = document.querySelectorAll('input[type="text"], input[type="password"], input[type="email"], input[type="number"], input[type="search"], input[type="url"], input[type="tel"] , input[type="range"] , input[type="date"] , input[type="time"] , input[type="month"] , input[type="week"] , input[type="datetime-local"] , select');

inputs.forEach(input => {
    input.addEventListener("change", (event) => {
        const targetElement = event.target;
        const value = event.target.value;
        const xpath = getElementXPath(targetElement);
        const page = event.srcElement.baseURI;
        logEvent("input", xpath , value, page);
    });
});

//Text Areas
const textareas = document.querySelectorAll('textarea')

textareas.forEach(input => {
    input.addEventListener("change", (event) => {
        const targetElement = event.target;
        const value = event.target.value;
        const xpath = getElementXPath(targetElement);
        const page = event.srcElement.baseURI;
        logEvent("input", xpath , value, page);
    });
});

//Forms
const forms = document.querySelectorAll('form');

forms.forEach(input => {
    input.addEventListener("submit", (event) => {
        const targetElement = event.target;
        const value = event.target.value;
        const xpath = getElementXPath(targetElement);
        const page = event.srcElement.baseURI;
        logEvent("submit", xpath , value, page);
    });
});


chrome.runtime.onMessage.addListener( async (message, sender, sendResponse) => {

    let response = await new Promise( function(myResolve,myReject){
        try{
            if (message.type === "runStep"){
                console.log(message.data);
                if (message.data.event == 'click'){
                    try{
                        console.log('click!!')
                        const elem = document.evaluate(
                                message.data.path,
                                document,
                                null,
                                XPathResult.FIRST_ORDERED_NODE_TYPE,
                                null
                            ).singleNodeValue;
                        elem.click();
                        
                        myResolve(true)
                        sendResponse(true)
                    }catch(error){
                        
                        myReject(error)
                        sendResponse(error.message)
                    }
                }else if (message.data.event == 'open'){
                    try{
                        myResolve(true)
                        sendResponse(true)
                        console.log('open!!')
                        document.location = message.data.path;
                    }catch(error){
                        myReject(error)
                        sendResponse(error.message)
                    }
                }else if (message.data.event == 'input'){
                    try{
                        console.log('input!!')
                        const elem = document.evaluate(
                            message.data.path,
                            document,
                            null,
                            XPathResult.FIRST_ORDERED_NODE_TYPE,
                            null
                        ).singleNodeValue;
                        elem.value = message.data.value;
                        myResolve(true)
                        sendResponse(true)
                    }catch(error){
                        myReject(error)
                        sendResponse(error.message)
                    }
                }else if (message.data.event == 'submit'){
                    try{
                        console.log('submit!!')
                        const elem = document.evaluate(
                            message.data.path,
                            document,
                            null,
                            XPathResult.FIRST_ORDERED_NODE_TYPE,
                            null
                        ).singleNodeValue;
                        elem.submit();
                        myResolve(true)
                        sendResponse(true)
                    }catch(error){
                        myReject(error)
                        sendResponse(error.message)
                    }
                }
            }
        }catch(error){
            myReject(error)
            sendResponse(error)
        }
    })

    return true; //to keep channel open

});