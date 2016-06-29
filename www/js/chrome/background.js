/***
****	EVENT HANDLERS
***/

/*
**	Returns true in the result listener if the user is logged in, false if not
*/
function isUserLoggedIn(resultListener)
{
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "https://app.quantimo.do/api/user/me", true);
	xhr.onreadystatechange = function()
		{
			if (xhr.readyState === 4)
			{
				var userObject = JSON.parse(xhr.responseText);
				/*
				 * it should hide and show sign in button based upon the cookie set or not
				 */
				if(typeof userObject.displayName !== "undefined")
				{
						console.log(userObject.displayName + " is logged in.  ");
				} else {
					var url = "https://app.quantimo.do/api/v2/auth/login";
					chrome.tabs.create({"url":url, "selected":true});
				}
			}
		};
	xhr.send();
}

function sendEmail(emailUrl) {
	chrome.tabs.create({ url: emailUrl }, function(tab) {
		setTimeOut(function() {
			chrome.tabs.remove(tab.id);
		}, 500);
	});
}

/*
**	Called when the extension is installed
*/
chrome.runtime.onInstalled.addListener(function()
{
	var notificationInterval = parseInt(localStorage.notificationInterval || "60");

	if(notificationInterval == -1)
	{
		chrome.alarms.clear("moodReportAlarm");
		console.log("Alarm cancelled");
	}
	else
	{
		var alarmInfo = {periodInMinutes: notificationInterval};
		chrome.alarms.create("moodReportAlarm", alarmInfo);
		console.log("Alarm set, every " + notificationInterval + " minutes");
	}
});

/*
**	Called when an alarm goes off (we only have one)
*/
chrome.alarms.onAlarm.addListener(function(alarm)
{
	console.log('onAlarm Listener heard this alarm ', alarm);
	var showNotification = (localStorage.showNotification || "true") == "true" ? true : false;

    if(showNotification){
		showTrackingInboxNotification(alarm);
        //checkForNotifications();
    }
});

/*
**	Called when the "report your mood" notification is clicked
*/
chrome.notifications.onClicked.addListener(function(notificationId)
{
    var windowParams;

	var badgeParams = {text:""};
	chrome.browserAction.setBadgeText(badgeParams);

	if(notificationId === "moodReportNotification")
	{
		windowParams = {url: "rating_popup.html",
							type: 'panel',
							top: 0.6 * screen.height,
							left: screen.width - 371,
							width: 371,
							height: 70
						   };
		chrome.windows.create(windowParams);
	}

    if(notificationId === "trackingInboxNotification")
    {
        windowParams = {
            url: "/www/index.html#/app/reminders-inbox",
            type: 'panel',
            top: 0.2 * screen.height,
            left: 0.4 * screen.width,
            width: 450,
            height: 750
        };
        chrome.windows.create(windowParams);
    }
	chrome.notifications.clear(notificationId);


	// chrome.notifications.getAll(function (notifications){
	// 	console.log('Got all notifications ', notifications);
	// 	for(var i = 0; i < notifications.length; i++){
	// 		chrome.notifications.clear(notifications[i].id);
	// 	}
	// });
});

/*
**	Handles extension-specific requests that come in, such as a
** 	request to upload a new measurement
*/
chrome.extension.onMessage.addListener(function(request, sender, sendResponse)
{
	console.log("Received request: " + request.message);
	if(request.message == "uploadMeasurements")
	{
		pushMeasurements(request.payload, null);
	}
});



/***
****	HELPER FUNCTIONS
***/

function pushMeasurements(measurements, onDoneListener)
{
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "https://app.quantimo.do/api/measurements/v2", true);
	xhr.onreadystatechange = function()
		{
			// If the request is completed
			if (xhr.readyState == 4)
			{
				console.log("QuantiModo responds:");
				console.log(xhr.responseText);

				if(onDoneListener != null)
				{
					onDoneListener(xhr.responseText);
				}
			}
		};
	xhr.send(JSON.stringify(measurements));
}

function objectLength(obj) {
    var result = 0;
    for(var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            // or Object.prototype.hasOwnProperty.call(obj, prop)
            result++;
        }
    }
    return result;
}

function checkForNotifications()
{
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://app.quantimo.do:443/api/v1/trackingReminderNotifications", false);
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === 4)
        {
            var notificationsObject = JSON.parse(xhr.responseText);
            var numberOfWaitingNotifications = objectLength(notificationsObject.data);
            if(numberOfWaitingNotifications > 0) {
                showTrackingInboxNotification();
            }
        }
    };

    xhr.send();
}

function showTrackingInboxNotification(alarm){


    var notificationParams = {
        type: "basic",
        title: "How are you?",
        message: "It's time to track!",
        iconUrl: "www/img/icons/icon_700.png",
        priority: 2
    };

	var trackingReminder = JSON.parse(alarm.name);
	
	if(trackingReminder.variableName){
		notificationParams.title = 'Time to track ' + trackingReminder.variableName + '!';
		notificationParams.message = 'Click to open reminder inbox';
	}

    chrome.notifications.create("trackingInboxNotification", notificationParams, function(id){});

    var showBadge = (localStorage["showBadge"] || "true") == "true" ? true : false;

    if(showBadge)
    {
        var badgeParams = {text:"?"};
        chrome.browserAction.setBadgeText(badgeParams);
    }
}