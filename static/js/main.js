$(document).ready(function() {
	$("#entries").submit(function(e) {
		e.preventDefault();
		var entry = $("#entry").val();
		addEntry(entry);
	});

	$(document).on('click', '.delete', function() {
		delete_entry($(this).closest("tr").attr("id"));
	});

	$(".entry").each(function() {
  		var option = {trigger : $(this).find(".button_edit"), action : "click"};
  		var id = $(this).attr("id");
  		$(this).find(".editable").editable(option, function(e){
    		editEntry(id, e.value);
  		});
  	});

 

	function addEntry(entry) {

		$.ajax({
			url: '/project',
			dataType: 'json',
			data: {
				"entry" : $("#entry").val(),
			},
			type: 'POST',
			success: function(response, status) {
				var hey = $("#entry").val();
				var id = response['id'];

				var html = "<tr id=" + id + " class= \"entry\">" + 
       			"<td class= \"editable\"> " + hey + " </td>" +
				
				"<td class=image> <img id=\"img" + id + "\" src= \"#\" width=275px height = 175px style= \"display: none\"> </td>" +
				"<td><label class=\"button button-glow button-rounded button-caution button-small file_button\"><input type= \"file\"/>Upload</label></td>" +
	    		"<td> <button type= \"button\" class=\"button button-glow button-rounded button-caution button-small file_button delete\" value= \"delete\"> Delete </button> </td>" +
				"<td> <button type=\"button\" value = \"edit\" class =\"button button-glow button-rounded button-caution button-small file_button button_edit\"> Edit</button> </td>" +
				"<td type= \"text\" class= \"created\">  </td>" +
        		"<td type= \"text\" class= \"updated\">  </td>";
				

				$("#table tr:first").after(html);

				var option = {trigger : $("#" + id).find(".button_edit"), action : "click"};
  				$("#" + id).find(".editable").editable(option, function(e){
    				editEntry(id, e.value);
  				});

				var update = response['updated_at'];
				var formated_update = moment(update).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
  				$("#" + id).find(".updated").html(formated_update);

  				var create = response['created_at'];
  				var formated_create = moment(create).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
  				$("#" + id).find(".created").html(formated_create);


				console.log(response);
			},
			error: function(data) {
				$('#message').text("Must enter an entry to submit.");
				$('#message').css('color', 'red');

			}
		});
	};



	function delete_entry(id ) {
		$.ajax({
			type: 'DELETE',
			url: '/project/' + id,
			dataType: 'json',
			success: function(response, status) {
				$("#" + id).remove()
			}
		});
	};


	function editEntry(id, edited_entry) {
        $.ajax({
            type: 'PUT',
            url:  '/project/' + id,
            data: {
                "entry": edited_entry
            },
            dataType: 'json',
            success: function(response, status) {
            	var update = response['updated_at'];
				var formated_update = moment(update).add(7, "hours").format('YYYY-MM-DD HH:mm:ss');
           		$("#" + id).find(".updated").html(formated_update)
            }
        });
    };

	$(function () {
    	$(document).on("change",":file", function () {
    		var id = $(this).closest('tr').attr('id');
       		if (this.files && this.files[0]) {
            	var reader = new FileReader();
            	var file = this.files[0];
            	var formData = new FormData();
            	formData.append("id", id);
            	formData.append("filename", file.name);
            	formData.append("data", file);
				reader.onload = function(e) {
					$('#img' + id).attr('src', e.target.result); 
					$('#img' + id).show();
					var request = new XMLHttpRequest();
					request.open("POST", "/upload");
					request.send(formData);
				}
            	reader.readAsDataURL(this.files[0]);
        	}
    	});
	});

});	