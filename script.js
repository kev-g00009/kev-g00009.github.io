var allNames;  // The original list of names
var names;  // The currently displayed names
var orderedNames = [];
var ordering = false;

var originalNames;  // Add this line to keep a copy of the original data

document.getElementById('upload-btn').addEventListener('click', function() {
    var fileInput = document.getElementById('file-upload');
    var file = fileInput.files[0];
    
    Papa.parse(file, {
        header: true,
        complete: function(results) {
            allNames = results.data;
            names = allNames.slice();  // Copy the original list to the displayed list
            populateTable('name-table', names);
        }
    });
});



document.getElementById('go-btn').addEventListener('click', function() {
    ordering = !ordering;
    document.getElementById('go-btn').textContent = ordering ? 'Stop' : 'Go';
});

document.getElementById('name-table').addEventListener('click', function(e) {
    if (ordering && e.target && e.target.nodeName == "TD") {
        var row = e.target.parentNode;
        var nameRow = JSON.parse(row.dataset.row);
        nameRow.originalIndex = names.findIndex(n => JSON.stringify(n) === JSON.stringify(nameRow));
        names.splice(nameRow.originalIndex, 1);
        orderedNames.push(nameRow);
        populateTable('name-table', names);
        populateTable('ordered-table', orderedNames, true);

        // Update the originalIndex property of each name in the orderedNames array
        orderedNames.forEach(function(name, index) {
            name.originalIndex = names.findIndex(n => JSON.stringify(n) === JSON.stringify(name));
        });
    }
});

document.getElementById('ordered-table').addEventListener('click', function(e) {
    if (e.target && e.target.nodeName == "TD") {
        var row = e.target.parentNode;
        var nameRow = JSON.parse(row.dataset.row);
        orderedNames.splice(orderedNames.findIndex(n => JSON.stringify(n) === JSON.stringify(nameRow)), 1);
        names.splice(nameRow.originalIndex, 0, nameRow);
        populateTable('name-table', names);
        populateTable('ordered-table', orderedNames, true);
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

// window.onload = function() {
//     orderedNames = [];
//     localStorage.clear();  // Clear localStorage
//     populateTable('ordered-table', orderedNames, true);
// };


document.getElementById('download-btn').addEventListener('click', function() {
    var csv = orderedNames.map((row, i) => {
        var rowIndex = (i + 1).toString().padStart(3, '0');
        return [currentAssistantNumber + rowIndex].concat(Object.values(row)).join(',');
    }).join('\r\n');  // Use '\r\n' instead of '\n'
    var blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'ordered-names.csv';
    a.click();
    URL.revokeObjectURL(url);
});

document.getElementById('search-bar').addEventListener('input', function() {
    var searchText = document.getElementById('search-bar').value;
    names = allNames.filter(name => JSON.stringify(name).toLowerCase().includes(searchText.toLowerCase()));
    populateTable('name-table', names);
});



window.addEventListener('beforeunload', function (e) {
    e.preventDefault();  // Cancel the event
    e.returnValue = '';  // Chrome requires returnValue to be set
});

function populateTable(tableId, namesArray, numbered = false) {
    var table = document.getElementById(tableId);
    while (table.firstChild) {
        table.firstChild.remove();
    }
    for (var i = 0; i < namesArray.length; i++) {
        var row = document.createElement('tr');
        row.dataset.row = JSON.stringify(namesArray[i]);
        var cell = document.createElement('td');
        var rowIndex = (i + 1).toString().padStart(3, '0');
        cell.textContent = numbered ? currentAssistantNumber + rowIndex + '. ' : '';
        row.appendChild(cell);
        for (var key in namesArray[i]) {
            cell = document.createElement('td');
            cell.textContent = namesArray[i][key];
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
}

$( function() {
    var assistantDialog, photographerDialog,
    assistant = $( "#assistant" ),
    photographers = $( "#photographers" ),
    assistantNames = ['Assistant 1', 'Assistant 2', 'Assistant 3'],
    photographerNames = ['John', 'Photographer 2', 'Photographer 3'],
    selectedAssistant = "",
    selectedPhotographers = [],
    stationNumber = 1;

    function addStation() {
        $( "#stations" ).append( "<p>Station #" + stationNumber + ": " + selectedPhotographers[stationNumber-1] + "</p>" );
        stationNumber++;
    }

    assistantDialog = $( "#assistant-dialog-form" ).dialog({
      autoOpen: false,
      modal: true,
      width: 500, // Set the width of the dialog
      buttons: {
        "Done": function() {
            // Get the selected assistant's number
            currentAssistantNumber = $('#assistant option:selected').data('number');
            orderNumber = 0;
          selectedAssistant = assistant.val();
          $( "#assistantDisplay" ).text( "Assistant: " + selectedAssistant );
          assistantDialog.dialog( "close" );
          photographerDialog.dialog( "open" );
        }
      }
    });

    photographerDialog = $( "#photographer-dialog-form" ).dialog({
      autoOpen: false,
      modal: true,
      width: 500, // Set the width of the dialog
      buttons: {
        "Add Photographer": function() {
          var selectedPhotographer = photographers.val();
          selectedPhotographers.push(selectedPhotographer);
          addStation();

          // Remove the selected photographer from the list
          $(`#photographers option[value='${selectedPhotographer}']`).remove();

          // Update the title for the next station
          photographerDialog.dialog('option', 'title', `Choose a photographer for Station #${stationNumber}`);
        },
        "Done": function() {
            // Get the selected assistant's number
            currentAssistantNumber = $('#assistant option:selected').data('number');
            orderNumber = 0;
          photographerDialog.dialog( "close" );
        }
      },
      open: function() {
        // Set the initial title
        $(this).dialog('option', 'title', `Choose a photographer for Station #${stationNumber}`);
      }
    });

    $( "#assistant-dialog-form" ).dialog( "open" );
});

