var allNames;  // The original list of names
var names;  // The currently displayed names
var orderedNames = [];
var ordering = false;
var filteredNames;
var stations = [];  // Array to store the list of stations



var originalNames;  // Add this line to keep a copy of the original data

document.getElementById('upload-btn').addEventListener('click', function() {
    var fileInput = document.getElementById('file-upload');
    var file = fileInput.files[0];
    
    Papa.parse(file, {
        header: true,
        complete: function(results) {
            allNames = results.data.map((row, index) => ({...row, originalIndex: index}));
            names = [...allNames]; 
            filteredNames = [...allNames];  // Copy of the allNames array for search functionality
            populateTable('name-table', filteredNames);
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
                
                // Add the station to the nameRow object
                nameRow.station = selectedStation;
              
                // Access the camera and capture the image when the video is clicked
                navigator.mediaDevices.getUserMedia({ video: true })
                .then(function(stream) {
                  // Set the video source to the camera stream
                  var video = document.createElement('video');
                  video.srcObject = stream;
                  video.play();
              
                  // Capture the image immediately when the video is ready
                  video.onloadedmetadata = function() {
                    var canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    var context = canvas.getContext('2d');
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    var dataUrl = canvas.toDataURL('image/jpeg');  // Capture the image as a JPEG
              
                    // Now you can store the dataUrl in your nameRow object and update your table
                    nameRow.image = dataUrl;
                    populateTable('ordered-table', orderedNames, true);
                    
                    // Stop the camera stream when you're done
                    video.srcObject.getTracks().forEach(track => track.stop());
                  };
              
                  // Add the video element to the page (you may want to create a specific container for it)
                  document.body.appendChild(video);
                  // Add the video element to the page
                  var videoContainer = document.getElementById('video-container');
                  videoContainer.appendChild(video);

                })
                .catch(function(error) {
                  console.log("Error accessing the camera: ", error);
                });
              
                names.splice(names.findIndex(n => n.Name === nameRow.Name && n.originalIndex === nameRow.originalIndex), 1);
                filteredNames.splice(filteredNames.findIndex(n => n.Name === nameRow.Name && n.originalIndex === nameRow.originalIndex), 1);
                orderedNames.push(nameRow);
                populateTable('name-table', filteredNames);
                populateTable('ordered-table', orderedNames, true);
              
                stationDialog.dialog("close");
              }              
          }
        });
      
        // Populate the select options with the stations
        var select = $('#station-select');
        select.empty();
        stations.forEach(function(station) {
          select.append($('<option></option>').val(station).html(station));
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
    var csv = orderedNames.map((row, i) => {
        var rowIndex = (i + 1).toString().padStart(3, '0');
        return [currentAssistantNumber + rowIndex].concat(Object.values(row)).join(',');
    }).join('\r\n');  
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
    filteredNames = names.filter(name => JSON.stringify(name).toLowerCase().includes(searchText.toLowerCase()));
    populateTable('name-table', filteredNames);
});



window.addEventListener('beforeunload', function (e) {
    e.preventDefault();  // Cancel the event
    e.returnValue = '';  // Chrome requires returnValue to be set
});

function populateTable(tableId, namesArray, includeStation = false, numbered = false) {
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
        if(numbered) row.appendChild(cell);  
        for (var key in namesArray[i]) {
            if (key !== 'originalIndex' && (includeStation || key !== 'station')) {  
                cell = document.createElement('td');
                if (key === 'image' && namesArray[i][key]) {  // If the key is 'image' and there is an image data URL
                    var img = document.createElement('img');  // Create a new img element
                    img.src = namesArray[i][key];  // Set the src attribute to the image data URL
                    img.height = 100;  // Set the height of the image (you can change this to suit your needs)
                    cell.appendChild(img);  // Add the img element to the cell
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
