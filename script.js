var names;
var orderedNames = [];
var currentNumber = 1;

document.getElementById('upload-btn').addEventListener('click', function() {
    var fileInput = document.getElementById('file-upload');
    var file = fileInput.files[0];
    var reader = new FileReader();

    reader.onload = function(e) {
        // This function is called when the file is loaded
        var text = reader.result;
        names = text.split('\n'); // Assuming names are separated by new lines

        populateList('name-list', names);
    };

    reader.readAsText(file); // This triggers the file reading
});

document.getElementById('go-btn').addEventListener('click', function() {
    var nameList = document.getElementById('name-list');
    if (nameList.firstChild) {
        var name = nameList.firstChild.textContent;
        // Remove the name from the original list
        nameList.firstChild.remove();
        // Add the name to the ordered list
        orderedNames.push(name);
        populateList('ordered-list', orderedNames);
        currentNumber++;
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

function populateList(listId, namesArray) {
    var list = document.getElementById(listId);
    // Clear the list
    while (list.firstChild) {
        list.firstChild.remove();
    }
    // Add each name to the list
    for (var i = 0; i < namesArray.length; i++) {
        var listItem = document.createElement('li');
        listItem.textContent = (i + 1) + '. ' + namesArray[i];
        list.appendChild(listItem);
    }
}
