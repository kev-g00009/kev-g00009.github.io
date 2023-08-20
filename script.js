var allNames;  // The original list of names
var names;  // The currently displayed names
var orderedNames = [];
var ordering = false;
var filteredNames;
var stations = [];  // Array to store the list of stations
var selectedPhotographers = [];



var originalNames;  // Add this line to keep a copy of the original data

document.getElementById('upload-btn').addEventListener('click', function() {
    var fileInput = document.getElementById('file-upload');
    var file = fileInput.files[0];
    
    Papa.parse(file, {
        header: true,
        complete: function(results) {
            var headerRow = results.data[0]; // Extracting the first row as the header
            allNames = results.data.slice(1).map((row, index) => ({...row, originalIndex: index})); // Skipping the header row
            names = [...allNames]; 
            filteredNames = [...allNames];  // Copy of the allNames array for search functionality
            populateTable('name-table', filteredNames, false, headerRow); // Passing the header row to the populateTable function

            // Hide the upload button after successful upload
            document.getElementById('upload-btn').style.display = 'none';
        }
    });

    // Show the reminder text
    document.getElementById('reminder-text').style.display = 'block';
});


document.getElementById('file-upload').addEventListener('change', function() {
  // Show the upload button when a new file is selected
  document.getElementById('upload-btn').style.display = 'block'; // or 'inline', 'inline-block', etc., depending on your desired appearance
});



document.getElementById('go-btn').addEventListener('click', function() {
    ordering = !ordering;
    document.getElementById('go-btn').textContent = ordering ? 'Stop' : 'Go';
});

document.getElementById('name-table').addEventListener('click', function(e) {
    if (ordering && e.target && e.target.nodeName == "TD") {
      var row = e.target.parentNode;
      var nameRow = JSON.parse(row.dataset.row);
  
      // Prompt the user to choose a station
      $(function() {
        var stationDialog = $("#station-dialog-form").dialog({
          autoOpen: false,
          modal: true,
          open: function() {
            $("#station-dialog-form").show();  // Show the dialog when it's opened
          },
          buttons: {
            "Done": function() {
                // Get the selected station
                var selectedStation = $('#station-select option:selected').val();

                // Find the index of the selected station in the stations array
                var stationIndex = stations.indexOf(selectedStation);

                // Get the corresponding photographer's name using the station index
                var photographerName = selectedPhotographers[stationIndex];

                // Construct the station string with the photographer's name
                selectedStation = selectedStation + ' (' + photographerName + ')';

                // Add the station to the nameRow object
                nameRow.station = selectedStation;

                // Get the camera input element
                var cameraInput = document.getElementById('camera-input');
                
                // Trigger the camera input when the Done button is clicked
                cameraInput.click();
              
                // When a picture is taken
                cameraInput.onchange = function(event) {
                  // Get the picture file
                  var file = event.target.files[0];
                  var reader = new FileReader();
              
                  reader.onloadend = function() {
                    // Get the data URL of the picture
                    var dataUrl = reader.result;
              
                    // Now you can store the dataUrl in your nameRow object and update your table
                    nameRow.image = dataUrl;
                    populateTable('ordered-table', orderedNames, true);
                  }
              
                  if (file) {
                    // Read the picture file as a data URL
                    reader.readAsDataURL(file);
                  }
                };
              
                names.splice(names.findIndex(n => n.Name === nameRow.Name && n.originalIndex === nameRow.originalIndex), 1);
                filteredNames.splice(filteredNames.findIndex(n => n.Name === nameRow.Name && n.originalIndex === nameRow.originalIndex), 1);
                orderedNames.push(nameRow);
                populateTable('name-table', filteredNames);
                populateTable('ordered-table', orderedNames, true);
              
                stationDialog.dialog("close");
              }                        
          }
        });
      
        // // Populate the select options with the stations
        // var select = $('#station-select');
        // select.empty();
        // stations.forEach(function(station) {
        //   select.append($('<option></option>').val(station).html(station));
        // });

        // Populate the select options with the stations
        var select = $('#station-select');
        select.empty();
        stations.forEach(function(station, index) {
            var photographerName = selectedPhotographers[index]; // Get the corresponding photographer's name
            var optionText = station + ' (' + photographerName + ')';

            select.append($('<option></option>').val(station).html(optionText));
        });
      
        stationDialog.dialog("open");
      });
    }
  });

  document.getElementById('ordered-table').addEventListener('click', function(e) {
    if (e.target && e.target.nodeName == "TD") {
      var row = e.target.parentNode;
      var nameRow = JSON.parse(row.dataset.row);
      var rowIndex = (orderedNames.findIndex(n => n.originalIndex === nameRow.originalIndex) + 1).toString().padStart(3, '0');
  
      if (window.confirm("Are you sure you want to move '" + currentAssistantNumber + rowIndex + "' back to 'All Names'?")) {
        orderedNames.splice(orderedNames.findIndex(n => n.Name === nameRow.Name && n.originalIndex === nameRow.originalIndex), 1);
        delete nameRow.station;  // Remove the 'station' property
        delete nameRow.image;  // Remove the image property
        names.push(nameRow);
        filteredNames = names;
        names.sort((a, b) => a.originalIndex - b.originalIndex);
        populateTable('name-table', filteredNames);
        populateTable('ordered-table', orderedNames, true);
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

// window.onload = function() {
//     orderedNames = [];
//     localStorage.clear();  // Clear localStorage
//     populateTable('ordered-table', orderedNames, true);
// };


document.getElementById('download-btn').addEventListener('click', function() {
  
  var filename = window.prompt("Please enter the filename:", "ordered_names.csv");

  if (filename) {
    var csv = orderedNames.map((row, i) => {
        var rowIndex = (i + 1).toString().padStart(3, '0');
        return [currentAssistantNumber + rowIndex].concat(Object.values(row)).join(',');
    }).join('\r\n');  
    var blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
    
});

document.getElementById('search-bar').addEventListener('input', function() {
    var searchText = document.getElementById('search-bar').value;
    filteredNames = names.filter(name => JSON.stringify(name).toLowerCase().includes(searchText.toLowerCase()));
    populateTable('name-table', filteredNames);
});



window.addEventListener('beforeunload', function (e) {
    e.preventDefault();  // Cancel the event
    e.returnValue = '';  // Chrome requires returnValue to be set
});

function populateTable(tableId, namesArray, includeStation = false, headerRow = null) {
  var table = document.getElementById(tableId);
  // while (table.firstChild) {
  //     table.firstChild.remove();
  // }

  // If headerRow is provided, add it as a non-clickable row
  if (headerRow) {
      var header = table.createTHead();
      var headerRowElement = header.insertRow(0);
      headerRowElement.className = 'header-row'; // Adding the class to the header row
      for (var key in headerRow) {
          var cell = headerRowElement.insertCell(-1);
          cell.innerHTML = headerRow[key];
      }
  }

  for (var i = 0; i < namesArray.length; i++) {
      var row = document.createElement('tr');
      row.dataset.row = JSON.stringify(namesArray[i]);
      var cell = document.createElement('td');
      if (tableId === 'ordered-table') {  // Add the assistant number if the table is 'ordered-table'
          cell.textContent = currentAssistantNumber + (i + 1).toString().padStart(3, '0') + '. ';
      }
      row.appendChild(cell);
      for (var key in namesArray[i]) {
          if (key !== 'originalIndex' && (includeStation || key !== 'station')) {
              cell = document.createElement('td');
              if (key === 'image' && namesArray[i][key]) {
                  var img = document.createElement('img');
                  img.src = namesArray[i][key];
                  img.height = 100;
                  cell.appendChild(img);
              } else {
                  cell.textContent = namesArray[i][key];
              }
              row.appendChild(cell);
          }
      }
      table.appendChild(row);
  }
}






$( function() {
    var assistantDialog, photographerDialog,
    assistant = $( "#assistant" ),
    photographers = $( "#photographers" ),
    assistantNames = ['Assistant 1', 'Assistant 2', 'Assistant 3', 'Assistant 4', 'Assistant 5', 'Assistant 6', 'Assistant 7', 'Assistant 8', 'Assistant 9'],
    photographerNames = ['Photographer 1', 'Photographer 2', 'Photographer 3', 'Photographer 4', 'Photographer 5', 'Photographer 6', 'Photographer 7', 'Photographer 8', 'Photographer 9'],
    selectedAssistant = "",
    
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
          stations.push("Station " + stationNumber);  // Add the station to the stations array
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
