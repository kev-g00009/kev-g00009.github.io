var names;
var orderedNames = [];
var ordering = false;

document.getElementById('upload-btn').addEventListener('click', function() {
    var fileInput = document.getElementById('file-upload');
    var file = fileInput.files[0];
    var reader = new FileReader();

    reader.onload = function(e) {
        // This function is called when the file is loaded
        var text = reader.result;
        names = text.split('\n'); // Assuming names are separated by new lines
        names.sort(); // Sort the names in alphabetical order

        populateTable('name-table', names);
    };

    reader.readAsText(file); // This triggers the file reading
});

document.getElementById('go-btn').addEventListener('click', function() {
    ordering = !ordering; // Toggle the ordering state
    document.getElementById('go-btn').textContent = ordering ? 'Stop' : 'Go';
});

document.getElementById('name-table').addEventListener('click', function(e) {
    if (ordering && e.target && e.target.nodeName == "TD") {
        var name = e.target.textContent;
        // Remove the name from the original list
        names.splice(names.indexOf(name), 1);
        // Add the name to the ordered list
        orderedNames.push(name);
        populateTable('name-table', names);
        populateTable('ordered-table', orderedNames, true);
    }
});

document.getElementById('ordered-table').addEventListener('click', function(e) {
    if (e.target && e.target.nodeName == "TD") {
        var name = e.target.textContent;
        var confirmation = confirm(`Are you sure you want to put back the name ${name}?`);
        if (confirmation) {
            // Remove the name from the ordered list
            orderedNames.splice(orderedNames.indexOf(name), 1);
            // Add the name back to the original list
            names.push(name);
            names.sort(); // Keep the names sorted
            populateTable('name-table', names);
            populateTable('ordered-table', orderedNames, true);
        }
    }
});

document.getElementById('download-btn').addEventListener('click', function() {
    var csv = orderedNames.join('\n');
    var blob = new Blob([csv], {type: 'text/csv'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'ordered-names.csv';
    a.click();
    URL.revokeObjectURL(url);
});

function populateTable(tableId, namesArray, numbered=false) {
    var table = document.getElementById(tableId);
    // Clear the table
    while (table.firstChild) {
        table.firstChild.remove();
    }
    // Add each name to the table
    for (var i = 0; i < namesArray.length; i++) {
        var row = document.createElement('tr');
        var cell = document.createElement('td');
        cell.textContent = numbered ? (i + 1) + '. ' + namesArray[i] : namesArray[i];
        row.appendChild(cell);
        table.appendChild(row);
    }
}
