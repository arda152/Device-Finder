// DOM elements
var selector = document.getElementById("brand-selector");
var helperText = document.getElementById("helperText");

var selectorButton = document.getElementById("brand-selector-button");

var columns = document.querySelector(".columns");

selector.focus();
// Listens for brand selection
selectorButton.addEventListener("click", function(e) {
    // Clear screen
    columns.innerHTML = "";
    // Check for errors
    if (!selector.value) {
        helperText.textContent = "Please enter a brand name";
        deleteFocus(selector);
        return false;
    }
    var brand = selector.value.toLowerCase();
    // Check if brand name exists in database

    // Clear error message
    helperText.textContent = "";
    // Make request with selected brand name
    var devicesPromise = makeRequest(parseUrl(brand));
    devicesPromise.then(function(devices) {

        // If response is empty array or if database tried to do autocomplete, display error message
        if (devices.length === 1 || devices[0].DeviceName.split(" ")[0].toLowerCase() !== brand) {
            helperText.textContent = "Brand name not found in database.";
            deleteFocus(selector);
            return false;
        }
        // Loop through the devices returned from API
        for (device of devices) {
            var deviceColumn = document.createElement("div");
            deviceColumn.classList.add("column", "is-one-third", "has-text-centered");
            // Prepare and sort data to display
            var preparedDevice = prepareDeviceForDisplay(device);
            // For each property, add a new line to display column
            for (property in preparedDevice) {
                deviceColumn.textContent += preparedDevice[property] + "\n";
            }
            columns.appendChild(deviceColumn);
        }
        // Clean selector and wait for next search
        selector.value = "";
        deleteFocus(selector);
        // If button has additional features, block
        e.preventDefault();
    }, function(err) {
        var errorDiv = document.createElement("div");
        errorDiv.classList.add("column", "is-half");
        errorDiv.textContent = "An occured with the server, please try again using a different brand name.";
        columns.appendChild(errorDiv);
    });

    // Parses the given brand name and prepares ajax url
    // Url return 5 latest devices from brand
    function parseUrl(selectedBrand) {
        return "https://fonoapi.freshpixl.com/v1/getlatest?brand=" + selectedBrand + "&limit=6&token=dee37f8fd64a0366bbbb958214e1a8aea0f3c4e53fc9d945"
    }

    // Function makes HTTP get request to an url
    // Turns the value into JSON array
    function makeRequest(url) {
        return fetch(url).then(function(response) {
            return response.json();
        });
    }

    // Takes an Array from the API and prepares an object for displaySection
    function prepareDeviceForDisplay(device) {
        let resultObject = {
            name: device.DeviceName
        };
        // API sends price as "About xxx", this cleans the data
        if (device.price) {
            resultObject.price = device.price.replace("About ", "");
        }
        resultObject.size = device.size.split(" ")[0] + "\"";
        resultObject.os = device.os.split(/[,;]/)[0];

        return resultObject;
    }
});

function deleteFocus(element) {
    element.value = "";
    element.focus();
}
