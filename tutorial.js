// Insert your Dropbox app key here:
var DROPBOX_APP_KEY = 'kb8mxvy1ax14rfk';

// Exposed for easy access in the browser console.
var client = new Dropbox.Client({key: DROPBOX_APP_KEY});
var transTable;

$(function () {
	// Insert a new task record into the table.
	function insertTransaction(text, trans) {
		transTable.insert({
			transValue: text,
			created: new Date(),
			transIncExp: trans
		});
	}

	// updateList will be called every time the table changes.
	function updateList() {
		$('#trans').empty();

		var records = transTable.query();

		// Sort by creation time.
		records.sort(function (transA, transB) {
			if (transA.get('created') < transB.get('created')) return 1;
			if (transA.get('created') > transB.get('created')) return -1;
			return 0;
		});

		// Add an item to the list for each task.
		var totalSaldo = 0;	
		for (var i = 0; i < records.length; i++) {
			var record = records[i];
			
			if(record.get('transIncExp') == true){
				totalSaldo = totalSaldo - parseInt(record.get('transValue'), 10);
			} else {
				totalSaldo = totalSaldo + parseInt(record.get('transValue'), 10);
			}
			
			$('#trans').append(
				renderTask(record.getId(),
					record.get('transIncExp'),
					record.get('transValue'), i, records.length));
		}
		
		//VFC - Inicio
		document.getElementById('spttSaldo').innerHTML = totalSaldo;
		document.getElementById('newTrans').value = "";
		document.getElementById('newTransR').value = "";
		//VFC - Fim
		
		addListeners();
		$('#newTrans').focus();
	}
	
	// The login button will start the authentication process.
	$('#loginButton').click(function (e) {
		e.preventDefault();
		// This will redirect the browser to OAuth login.
		client.authenticate();
	});

	// Try to finish OAuth authorization.
	client.authenticate({interactive:false}, function (error) {
		if (error) {
			alert('Authentication error: ' + error);
		}
	});

	if (client.isAuthenticated()) {
		// Client is authenticated. Display UI.
		$('#loginButton').hide();
		$('#main').show();

		client.getDatastoreManager().openDefaultDatastore(function (error, datastore) {
			if (error) {
				alert('Error opening default datastore: ' + error);
			}

			transTable = datastore.getTable('trans');

			// Populate the initial task list.
			updateList();

			// Ensure that future changes update the list.
			datastore.recordsChanged.addListener(updateList);
		});
	}

	// Set the completed status of a task with the given ID.
	function setCompleted(id, completed) {
		transTable.get(id).set('transValue', completed);
	}

	// Delete the record with a given ID.
	function deleteRecord(id) {
		transTable.get(id).deleteRecord();
	}

	// Render the HTML for a single task.
	function renderTask(id, completed, text, i, total) {
		var transSymb = "";
		var cssClassSymb = "";
		var cssClassLbl = "";
		if (completed == false){
			transSymb = '&#8594;'
			cssClassSymb = 'cssClassGreen';
			cssClassLbl = 'cssClassGreen';
		} else {
			transSymb = '&#8592;'
			cssClassSymb = 'cssClassRed';
			cssClassLbl = 'cssClassRed';
		}
		
		if (i => total-2) {
			return $('<li>').attr('id', id).append(
				$('<div style="width: 170px; float: left; margin: 0px auto; text-align: right;">').append(
					$('<span style="padding-right: 10px; ">').addClass(cssClassSymb).html(transSymb)
				).append(
					$('<span style="padding-right: 10px; ">').addClass(cssClassLbl).text(text)
				).append(
					$('<button>').addClass('deleteButton').html('&times;')
				)
			)
		} else {
			return $('<li>').attr('id', id).append(
				$('<div style="width: 200px; float: left; margin: 0px auto; text-align: right;">').append(
					$('<span style="padding-right: 10px; ">').addClass(cssClassSymb).html(transSymb)
				).append(
					$('<span style="padding-right: 10px; ">').addClass(cssClassLbl).text(text)
				)
			).append(
					$('<button>').addClass('deleteButtonP').html('&times;')
				)
		}
			//'delete'
			//.addClass(completed ? 'completed' : '');
			//$('#trans').prepend('<li>some new item</li>');
			//$('#nav > ul li').first().css('background-color', 'red');
	}

	// Register event listeners to handle completing and deleting.
	function addListeners() {
		$('span').click(function (e) {
			e.preventDefault();
			var li = $(this).parents('li');
			var id = li.attr('id');
			setCompleted(id, !li.hasClass('completed'));
		});

		$('button.deleteButton').click(function (e) {
			e.preventDefault();
			var id = $(this).parents('li').attr('id');
			deleteRecord(id);
		});
		$('button.deleteButtonP').click(function (e) {
			e.preventDefault();
			var id = $(this).parents('li').attr('id');
			deleteRecord(id);
		});
	}

	// Hook form submit and add the new task.
	$('#addForm').submit(function (e) {
		e.preventDefault();
		if (document.pressed == 'plus') {
			if ($('#newTrans').val().length > 0) {
				insertTransaction($('#newTrans').val(), false);
				$('#newTrans').val('');
			}
		} else {
			if ($('#newTrans').val().length > 0) {
				insertTransaction($('#newTrans').val(), true);
				$('#newTrans').val('');
			}
		}
		return false;
	});
	$('#newTrans').focus();
	
	$('#addFormR').submit(function (e) {
		e.preventDefault();
		if (document.pressed == 'plus') {
			if ($('#newTrans').val().length > 0) {
				insertTransaction($('#newTrans').val(), false);
				$('#newTrans').val('');
			}
		} else {
			if ($('#newTransR').val().length > 0) {
				insertTransaction($('#newTransR').val(), true);
				$('#newTransR').val('');
			}
		}
		return false;
	});
	$('#newTransR').focus();
	
});
