jQuery(document).ready(function($){
	if(typeof FileReader != "undefined" && !window.externalHost){
		$(".old_file_upoad_holder").hide();
		jQuery.event.props.push("dataTransfer");
		var drop_area = jQuery("body"),
				file_upload = jQuery(".file-upload")
				;

		/**
		 * EVENTS TO HANDLE THE FILE UPLOAD
		 */
		//allowed, so handle the upload
		jQuery(window).bind("file.upload.run", function(e, i, file, drop_area, list_area){
			var file_div = list_area.find(".fu-"+i).addClass("fu-in-progress").append(" <span class='percentage'><span>0</span>% uploaded</span>"),
					dest = $("#main-upload-dialog").data("html5-action"),
					progress_bar = file_div.find("span.percentage"),
					xhr = new XMLHttpRequest()
					;
			// Update progress bar
			xhr.upload.addEventListener("progress", function (evt) {
				if (evt.lengthComputable) {
          progress_bar.find("span").html(Math.round((evt.loaded / evt.total) * 100))
          progress_bar.find("span").data("progress-loaded",evt.loaded)
          progress_bar.find("span").data("progress-total",evt.total);
          jQuery(window).trigger("file.upload.progress", [evt]);
          //console.log(evt);
        }
			}, false);
			//loaded event
			xhr.addEventListener("load", function () {
				file_div.removeClass("fu-in-progress").addClass('fu-completed');
        jQuery(window).trigger("file.upload.change", [file_div]);
				//refresh the listing
				list_area.parents(".upload_block").siblings(".index_container").find("fieldset.filters_container input[type='text']").trigger("change");

			}, false);

			xhr.open("post", dest, true);
			// Set appropriate headers
			xhr.setRequestHeader("Content-Type", "multipart/form-data");
			xhr.setRequestHeader("X-File-Name", file.name);
			xhr.setRequestHeader("X-File-Size", file.size);
			xhr.setRequestHeader("X-File-Type", file.type);
			xhr.setRequestHeader("X-File-EventTimestamp", $("#main-upload-dialog .event-info").data("event-name"));
			// Send the file (doh)
			xhr.send(file);
		});
		//not allowed - end point (possibly add in extra info about why etc later on)
		jQuery(window).bind("file.upload.not_allowed", function(e, i, file, drop_area, list_area, entry){
			list_area.find(".fu-"+i).addClass('fu-error');
      $(entry).find("img").remove();
		});
		//check if the file is allowed to be uploaded
		jQuery(window).bind("file.upload.allowed", function(e, i, file, drop_area, list_area, entry){
			var dest = jQuery("#main-upload-dialog").data("allowed-check"),
					data = {filename:file.name}
					;
			jQuery.ajax({
				url:dest,
				data:data,
				method:"post",
				dataType:"json",
				success: function(res){
					if(res.error.length) jQuery(window).trigger("file.upload.not_allowed", [i, file, drop_area, list_area, entry]);
					else jQuery(window).trigger("file.upload.run", [i, file, drop_area, list_area]);
				},
				error: function(){
					jQuery(window).trigger("file.upload.not_allowed", [i, file, drop_area, list_area, entry])
				}
			});

		});
		//add in to the file list a preview of the file and its status
		jQuery(window).bind("file.upload.list_add", function(e, i, file, drop_area, list_area){
			//find the listing block
			var img = document.createElement("img"),
					//create a new entry for it
					entry = document.createElement("div");
					;
			list_area.addClass("fu-uploading-active");
			jQuery(img).attr('width', 60).css("height","50px");
			jQuery(entry).addClass("fu-"+i+" file-summary clearfix fu-uploading").html("<strong class='file-name'>"+file.name+"</strong>").prepend(img);
			if (typeof FileReader !== "undefined" && (/image/i).test(file.type)){
				reader = new FileReader();
				reader.onload = (function (theImg) {
					return function (evt) {
						theImg.src = evt.target.result;
						theImg.width = 60;
					};
				}(img));
				reader.readAsDataURL(file);
			}
			list_area.append(entry);
			//now its been added, trigger an event to see if we should upload it or not
			jQuery(window).trigger("file.upload.allowed", [i, file, drop_area, list_area, entry]);
		});
		//main upload function calling other events
		jQuery(window).bind("file.upload.all", function(e, files, drop_area, list_area){
			if(typeof files != "undefined"){
				for(var i=0; i<files.length; i++) jQuery(window).trigger("file.upload.list_add", [i, files[i], drop_area, list_area]);
			}else drop_area.addClass('fu-failed');
		});

		
		/**
		 * DRAG & DROP EVENTS TO TRIGGER THE UPLOADS
		 */
		var collection = $();
		drop_area.bind("dragleave", function(e){
			collection = collection.not(e.target);
			e.preventDefault();
			e.stopPropagation();
      if(collection.length === 0) jQuery(this).addClass("fu-dragleave").removeClass("fu-dragover fu-dragenter");
		}).bind("dragenter", function(e){
			e.preventDefault();
			e.stopPropagation();
			if(collection.length === 0) jQuery(this).addClass("fu-dragenter");
			collection = collection.add(e.target);
		}).bind("dragover", function(e){
			e.preventDefault();
			e.stopPropagation();
			jQuery(this).addClass("fu-dragover").removeClass("fu-failed fu-completed");
		}).bind("drop", function(e){
			e.preventDefault();
			e.stopPropagation();
			jQuery(this).addClass("fu-drop").removeClass("fu-dragover fu-dragenter");
			var t = document.getElementById(jQuery(this).attr('id')),
					list_area = jQuery(this).find(".drop-list");
			jQuery(window).trigger("file.upload.all", [e.dataTransfer.files, jQuery(this), list_area]);
		});
	}else{
		$(".old_file_upoad_holder").show();
		$("#old-upload-dialog").show();
	}
});

var wildfire_upload = {

	settings: {
		"destination": "/admin/media/upload/",
		"progress":    this.progress,
		"load":        this.load,
		"eventName":   Date.now()
	},

	init: function(settings) {
		if(settings && typeof(settings) == 'object') {
  		$.extend(this.settings, settings);
  	}
  },

  upload: function(file) {
  	var xhr = new XMLHttpRequest();
		xhr.addEventListener("progress", this.settings.progress);
		xhr.addEventListener("load", this.settings.load);
		xhr.open("post", this.settings.destination, true);
		xhr.setRequestHeader("Content-Type", "multipart/form-data");
		xhr.setRequestHeader("X-File-Name", file.name);
		xhr.setRequestHeader("X-File-Size", file.size);
		xhr.setRequestHeader("X-File-Type", file.type);
		xhr.setRequestHeader("X-File-EventTimestamp", this.settings.eventName);
		xhr.send(file);
  },

  progress: function(event) {
  	console.log(event);
  },

  load: function(response) {
  	console.log(response);
  }


};







