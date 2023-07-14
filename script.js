var allNames;  // The original list of names
var names;  // The currently displayed names
var orderedNames = [];
var ordering = false;

document.getElementById('upload-btn').addEventListener('click', function() {
    var fileInput = document.getElementById('file-upload');
    var file = fileInput.files[0];
    var reader = new FileReader();

    reader.onload = function(e) {
        var text = reader.result;
        allNames = text.split('\n');
        allNames.sort();
        names = allNames.slice();  // Copy the original list to the displayed list
        populateTable('name-table', names);
    };

    reader.readAsText(file);
});

document.getElementById('go-btn').addEventListener('click', function() {
    ordering = !ordering;
    document.getElementById('go-btn').textContent = ordering ? 'Stop' : 'Go';
});

document.getElementById('name-table').addEventListener('click', function(e) {
    if (ordering && e.target && e.target.nodeName == "TD") {
        var name = e.target.textContent;
        names.splice(names.indexOf(name), 1);
        allNames.splice(allNames.indexOf(name), 1);  // Also remove the name from allNames
        orderedNames.push(name);
        populateTable('name-table', names);
        populateTable('ordered-table', orderedNames, true);
        // localStorage.setItem('orderedNames', JSON.stringify(orderedNames));  // Save orderedNames to localStorage
    }
});

document.getElementById('ordered-table').addEventListener('click', function(e) {
    if (e.target && e.target.nodeName == "TD") {
        var name = e.target.textContent.split('. ')[1];
        if (window.confirm('Are you sure you want to put back the name ' + name + '?')) {
            orderedNames.splice(orderedNames.indexOf(name), 1);
            names.push(name);
            allNames.push(name);  // Also add the name back to allNames
            names.sort();
            allNames.sort();  // Sort allNames to maintain the alphabetical order
            populateTable('name-table', names);
            populateTable('ordered-table', orderedNames, true);
            // localStorage.setItem('orderedNames', JSON.stringify(orderedNames));  // Save orderedNames to localStorage
        }
    }
});

// // At the beginning, check if we have any orderedNames saved
// window.onload = function() {
//     var savedNames = JSON.parse(localStorage.getItem('orderedNames'));
//     if (savedNames) {
//         orderedNames = savedNames;
//         populateTable('ordered-table', orderedNames, true);
//     }
// };

window.onload = function() {
    orderedNames = [];
    localStorage.clear();  // Clear localStorage
    populateTable('ordered-table', orderedNames, true);
};


document.getElementById('download-btn').addEventListener('click', function() {
    var csv = orderedNames.map((name, i) => (i + 1) + '. ' + name).join('\n');
    var blob = new Blob([csv], {type: 'text/csv'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'ordered-names.csv';
    a.click();
    URL.revokeObjectURL(url);
});

document.getElementById('search-bar').addEventListener('input', function() {
    var searchText = document.getElementById('search-bar').value;
    names = allNames.filter(name => name.toLowerCase().includes(searchText.toLowerCase()));
    populateTable('name-table', names);
});

function populateTable(tableId, namesArray, numbered=false) {
    var table = document.getElementById(tableId);
    while (table.firstChild) {
        table.firstChild.remove();
    }
    for (var i = 0; i < namesArray.length; i++) {
        var row = document.createElement('tr');
        var cell = document.createElement('td');
        cell.textContent = numbered ? (i + 1) + '. ' + namesArray[i] : namesArray[i];
        row.appendChild(cell);
        table.appendChild(row);
    }
}

window.addEventListener('beforeunload', function (e) {
    e.preventDefault();  // Cancel the event
    e.returnValue = '';  // Chrome requires returnValue to be set
});
