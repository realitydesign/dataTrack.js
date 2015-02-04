// dataTrack.js v1.0.2 by Ben Fried @ Lucid Fusion, Inc.
// http://os.lucidfusion.com/datatrack

(function( $ ) {
    var trackEvents = [];
    
    $.dataTrack = function(options) {

        if (trackEvents.length > 0) {
            $.each(trackEvents, function (index, value) {
                value.element.off(value.event); 
            });
        }

        if (options != 'disable') {
            if (options) {
                var functions = options;
            } else {
                var functions = function(action, category, label, value) { 
                    ga('send', 'event', category, action, label, value); 
                };
            }

            $('[data-track]').each(function() {
                trackElement($(this), false);
            });
            $('[data-track-children]').each(function() {
                trackElement($(this), true);
            });
        }

        function trackElement(element, children) {
            if (children) {
                var data = element.data('trackChildren');
            } else {
                var data = element.data('track');
            }

            if (data.indexOf('[') > -1) { // multiple events in brackets?
                data = data.substr(0, data.length-1); // remove the final single quote
                var start = data.indexOf('[');
                var stop = data.indexOf(']');
                // extract the text in the brackets, get rid of single quotes, and split the comma separated items in to an array
                var events = data.substr(start+1,stop-start-1).split("'").join("").split(",");
                // Get rid of the events part of the string
                data = data.substr(stop);
                // Get rid of anything between the old events and the begining of the category
                var start = data.indexOf("'");
                data = data.substr(start+1).split("', '");
                if (data[1] === undefined) {
                    // No spaces between commas?
                    data = data.join("");
                    data = data.split("','");
                }
            } else {
                data = data.substr(1, data.length-2); // remove initial and final single quote
                data = data.split("', '");
                if (data[1] === undefined) {
                    // No spaces between commas?
                    data = data.join("");
                    data = data.split("','");  
                }
                var events = [data[0]];
                data.shift();
            }
            var track = {
                events: events,
                category: data[0],
                label: data[1],
                value: data[2]
            };

            // Bind tracking
            $.each(track.events, function(index, event) {
                if (children) {
                    element.children().on(event, function() {
                        // Dynamic labels
                        var label = track.label;
                        if (element.data('dynamicLabel')) {
                            label = label + eval('$(this)' + element.data('dynamicLabel'));
                        }
                        functions(event, track.category, label, track.value);
                    });
                    trackEvents.push({ element: element.children(), event: event });
                } else {
                    element.on(event, function() {
                        // Dynamic labels
                        var label = track.label;
                        if (element.data('dynamicLabel')) {
                            label = label + eval('element' + element.data('dynamicLabel'));
                        }
                        functions(event, track.category, label, track.value);
                    });
                    trackEvents.push({ element: element, event: event });
                }
            });
        }

    };

}( jQuery ));