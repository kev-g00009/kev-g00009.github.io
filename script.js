document.getElementById('upload-btn').addEventListener('click', function() {
    var fileInput = document.getElementById('file-upload');
    var file = fileInput.files[0];
    var reader = new FileReader();

    reader.onload = function(e) {
        // This function is called when the file is loaded
        var text = reader.result;
        var names = text.split('\n'); // Assuming names are separated by new lines

        var list = document.getElementById('name-list');
        // Clear any existing names
        while (list.firstChild) {
            list.firstChild.remove();
        }
        // Add each name to the list
        for (var i = 0; i < names.length; i++) {
            var listItem = document.createElement('li');
            listItem.textContent = names[i];
            list.appendChild(listItem);
        }
    };

    reader.readAsText(file); // This triggers the file reading
});
