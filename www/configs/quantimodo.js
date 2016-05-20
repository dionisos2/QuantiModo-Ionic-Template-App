
var getPlatform = function(){
    if(typeof ionic !== "undefined" &&
        typeof ionic.Platform !== "undefined" &&
        typeof ionic.Platform.isIOS !== "undefined" &&
        typeof ionic.Platform.isAndroid !== "undefined" ) {
        return ionic.Platform.isIOS() ? "iOS" : ionic.Platform.isAndroid() ? "Android" : "Web";
    }
    else {
        return "Ionic";
    }
};

window.config = {
    bugsnag:{
        notifyReleaseStages:['Production','Staging']
    },
    clientSourceName : "QuantiModo "+ getPlatform(),
    domain : 'app.quantimo.do',
    environment: "Development",
    permissions : ['readmeasurements', 'writemeasurements'],
    port : '4417',
    protocol : 'https',
    shoppingCartEnabled : true
};

config.appSettings  = {
    appName : 'QuantiModo',
    allowOffline : true,
    loaderImagePath : 'img/pop-tart-cat.gif',
    
    settingsPageOptions :
    {
        showReminderFrequencySelector : true
    },

    defaultState : 'app.remindersInbox',
    welcomeState : 'app.welcome',

    primaryOutcomeVariable : 'Mood',

    appStorageIdentifier: 'QuantiModoData*',

    headline : 'Sync and Analyze Your Data',
    features: [
        ' - Automatically backup and sync your data across devices',
        ' - Track diet, treatments, symptoms, and anything else',
        ' - Analyze your data to see the top predictors for your Mood'
    ],

    primaryOutcomeVariableDetails : {
        id : 1398,
        name : "Overall Mood",
        category : "Mood",
        abbreviatedUnitName : "/5",
        combinationOperation: "MEAN"
    },

    primaryOutcomeVariableRatingOptionLabels : [
        'Depressed',
        'Sad',
        'OK',
        'Happy',
        'Ecstatic'
    ],

    positiveRatingOptions : [
        {
            value: 'depressed',
            img: 'img/ic_face_depressed.png'
        },
        {
            value: 'sad',
            img: 'img/ic_face_sad.png'
        },
        {
            value: 'ok',
            img: 'img/ic_face_ok.png'
        },
        {
            value: 'happy',
            img: 'img/ic_face_happy.png'
        },
        {
            value: 'ecstatic',
            img: 'img/ic_face_ecstatic.png'
        }
    ],

    welcomeText : "Let's start off by reporting your first mood on the card below",
    primaryOutcomeVariableTrackingQuestion : "How are you?",
    primaryOutcomeVariableAverageText : "Your average mood is ",
    mobileNotificationImage : "file://img/icon_128.png",
    mobileNotificationText : "Time to Track",
    primaryOutcomeValueConversionDataSet: {
        "1": "depressed",
        "2": "sad",
        "3": "ok",
        "4": "happy",
        "5": "ecstatic"
    },
    primaryOutcomeValueConversionDataSetReversed : {
        "depressed" : 1,
        "sad" : 2,
        "ok" : 3,
        "happy" : 4,
        "ecstatic": 5
    },

    intro : [
        // screen 1
        {
            img : {
                width : '150',
                height : '150',
                url : 'img/icon.png'
            },
            content : {

                firstP : {
                    visible : true,
                    content : 'Welcome to QuantiModo',
                    classes : 'intro-header positive'
                }, 
                logoDiv : {
                    visible : true,
                    id : 'logo'
                },
                finalP : {
                    visible : true,
                    content : 'QuantiModo allows you track your <span class="positive">Mood</span> and identify the hidden factors which may most influence it.',
                    classes : 'intro-paragraph',
                    buttonBarVisible : true   
                }
            }
        },
        // screen 2
        {
            img : {
                height : '70',
                width : '70'
            },
            content : {

                showOutcomeVariableImages : true,
                showFirstBr : true,   
                finalP: {
                    visible : true,
                    content : 'Go to the <span class="positive">Track Mood</span> page to report your Mood!',
                    classes : 'intro-paragraph',
                    buttonBarVisible : true
                } 
            }
        },
        // screen 3
        {
            img : {
                width : '140',
                height : '220',
                url : 'img/track_moods.png'
            },
            content : {

                firstP : {
                    visible : true,
                    content : 'Track Mood',
                    classes : 'intro-header positive'
                },                 
                logoDiv : {
                    visible : true,
                    id : ''
                },
                showSecondBr : true,
                finalP: {
                    visible : true,
                    content : 'On the <span class="positive">Track Mood</span> page, you can view your <span class="positive">average Mood</span> as well as charts illustrating how it changes over time.',
                    classes : 'intro-paragraph-small',
                    buttonBarVisible : true
                }
            }
        },
        // screen 4
        {
            img : {
                width : '200',
                height : '150',
                url : 'img/history_page.png'
            },
            content : {
                firstP : {
                    visible : true,
                    content : 'History',
                    classes : 'intro-header positive'
                }, 
                showFirstBr : true,
                logoDiv : {
                    visible : true,
                    id : 'logo'
                },
                showSecondBr : true,
                finalP: {
                    visible : true,
                    content : 'You can see and edit your past mood ratings and notes by opening the <span class="positive">History</span> page.',
                    classes : 'intro-paragraph',
                    buttonBarVisible : true
                }
            }
        },
        // screen 5
        {
            img : {
                width : '220',
                height : '200',
                url : 'img/mood_note.png'
            },
            content : {
                firstP : {
                    visible : true,
                    content : 'Add a Note',
                    classes : 'intro-header positive'
                }, 
                logoDiv : {
                    visible : true,
                    id : 'logo'
                },
                finalP: {
                    visible : true,
                    content : 'Add a note by tapping on a mood rating in the <span class="positive">History</span> page. You can also <span class="positive">Edit</span> your Mood there too.',
                    classes : 'intro-paragraph',
                    buttonBarVisible : true
                }
            }
        },
        // screen 6
        {
            img : {
                width : '220',
                height : '190',
                url : 'img/track_foods.png'
            },
            content : {
                firstP : {
                    visible : true,
                    content : 'Track Foods',
                    classes : 'intro-header positive'
                }, 
                logoDiv : {
                    visible : true,
                    id : 'logo'
                },
                finalP: {
                    visible : true,
                    content : 'Track your diet on the <span class="positive">Track Foods</span> page. You can also <span class="positive">Add a new Food Variable</span> if you don\'t find the meal you looked for in the search results.',
                    classes : 'intro-paragraph-small',
                    buttonBarVisible : true
                }
            }
        },
        // screen 7
        {
            img : {
                width : '190',
                height : '180',
                url : 'img/track_symptoms.png'
            },
            content : {

                firstP : {
                    visible : true,
                    content : 'Track Symptoms',
                    classes : 'intro-header positive'
                }, 
                
                logoDiv : {
                    visible : true,
                    id : 'logo'
                },
                
                finalP: {
                    visible : true,
                    content : 'Track any symptom on the <span class="positive">Track Symptoms</span> page. You can also <span class="positive">Add a new Symptom</span> if you don\'t find the symptom you looked for in the search results.',
                    classes : 'intro-paragraph-small',
                    buttonBarVisible : true
                }   
            }
        },
        // screen 8
        {
            img : {
                width : '210',
                height : '180',
                url : 'img/track_treatments.png'
            },
            content : {
                firstP : {
                    visible : true,
                    content : 'Track Treatments',
                    classes : 'intro-header positive'
                },                 
                logoDiv : {
                    visible : true,
                    id : 'logo'
                },
                finalP: {
                    visible : true,
                    content : 'Track your treatments on the <span class="positive">Track Treatments</span> page. You can also <span class="positive">Add a new Treatment</span> if you don\'t find the treatment you looked for in the search results.',
                    classes : 'intro-paragraph-small',
                    buttonBarVisible : true
                }
            }
        },
        // screen 9
        {
            img : {
                width : '220',
                height : '200',
                url : 'img/positive_predictors.png'
            },
            content : {

                firstP : {
                    visible : true,
                    content : 'Positive Predictors',
                    classes : 'intro-header positive'
                }, 
                
                logoDiv : {
                    visible : true,
                    id : 'logo'
                },
                
                finalP: {
                    visible : true,
                    content : 'Positive Predictors are the factors most predictive of <span class="positive">IMPROVING</span> Mood for the average QuantiModo user.',
                    classes : 'intro-paragraph-small',
                    buttonBarVisible : true
                }
            }
        },
        // screen 10
        {
            img : {
                width : '220',
                height : '200',
                url : 'img/negative_predictors.png'
            },
            content : {

                firstP : {
                    visible : true,
                    content : 'Negative Predictors',
                    classes : 'intro-header positive'
                },
                
                logoDiv : {
                    visible : true,
                    id : 'logo'
                },
                
                finalP: {
                    visible : true,
                    content : 'Negative Predictors are the factors most predictive of <span class="positive">DECREASING</span> Mood for the average QuantiModo user.',
                    classes : 'intro-paragraph-small',
                    buttonBarVisible : true
                }  
            }
        },
        // screen 11
        {
            img : {
                width : '180',
                height : '180',
                url : 'img/ic_face_ecstatic.png'
            },
            content : {

                firstP : {
                    visible : true,
                    content : 'We are feeling ecstatic that you\'re helping us derive a mathematical equation for happiness!',
                    classes : 'intro-paragraph positive'
                }, 
                
                logoDiv : {
                    visible : true,
                    id : 'logo'
                },
                finalP: {
                    visible : true,
                    content : 'Now start tracking and optimize your life!',
                    classes : 'intro-paragraph-small',
                    buttonBarVisible : true
                }
            }
        }
    ],

    helpPopupMessages : {
        "#/app/track" :'Here, you can view your <span class="positive">average Mood</span> as well as charts illustrating how it changes over time', 
        "#/app/history" :'You can see and edit your past mood ratings and notes by tapping on any item in the list.  <br/> <br/>You can also Add a note by tapping on a mood rating in the list.',
        "#/app/track_factors_category/Foods" :'You can track your diet on this page. You can also <span class="positive">Add a new Food Variable</span> if you do not find the meal you looked for in the search results.',
        "#/app/track_factors_category/Symptoms" :'You can track any symptom on this page. You can also <span class="positive">Add a new Symptom</span> if you don\'t find the symptom you looked for in the search results.',
        "#/app/track_factors_category/Treatments" :'You can track any treatment on this page. You can also <span class="positive">Add a new Treatment</span> if you don\'t find the treatment you looked for in the search results.',
        "#/app/positive" :'Positive Predictors are the factors most predictive of <span class="positive">IMPROVING</span> Mood for the average QuantiModo user.',
        "#/app/negative" :'Negative Predictors are the factors most predictive of <span class="positive">DECREASING</span> for the average QuantiModo user.'
    },

    remindersInbox : {

    },

    wordAliases : {
        
    },

    menu : [
        {
            title : 'Reminder Inbox',
            href : '#/app/reminders-inbox',
            icon : 'ion-archive'
        },
        {
            title : 'Overall Mood',
            click : 'togglePrimaryOutcomeSubMenu',
            showSubMenuVariable : 'showPrimaryOutcomeSubMenu',
            isSubMenuParent : true,
            collapsedIcon : 'ion-chevron-right',
            expandedIcon : 'ion-chevron-down'
        },
        {
            title : 'Charts',
            isSubMenuChild : true,
            showSubMenuVariable : 'showPrimaryOutcomeSubMenu',
            href : '#/app/track',
            icon : 'ion-arrow-graph-up-right'
        },
        {
            title : 'History',
            isSubMenuChild : true,
            showSubMenuVariable : 'showPrimaryOutcomeSubMenu',
            href : '#/app/history',
            icon : 'ion-ios-list-outline'
        },
        {
            title : 'Positive Predictors',
            isSubMenuChild : true,
            showSubMenuVariable : 'showPrimaryOutcomeSubMenu',
            href : '#/app/positive',
            icon : 'ion-happy-outline'
        },
        {
            title : 'Negative Predictors',
            isSubMenuChild : true,
            showSubMenuVariable : 'showPrimaryOutcomeSubMenu',
            href : '#/app/negative',
            icon : 'ion-sad-outline'
        },
        {
            title : 'Emotions',
            click : 'toggleEmotionsSubMenu',
            showSubMenuVariable : 'showEmotionsSubMenu',
            isSubMenuParent : true,
            collapsedIcon : 'ion-happy-outline',
            expandedIcon : 'ion-chevron-down'
        },
        {
            title : 'Manage Reminders',
            isSubMenuChild : true,
            showSubMenuVariable : 'showEmotionsSubMenu',
            href : '#/app/reminders-manage/Emotions',
            icon : 'ion-android-notifications-none'
        },
        {
            title : 'Record Rating',
            isSubMenuChild : true,
            showSubMenuVariable : 'showEmotionsSubMenu',
            href : '#/app/track_factors_category/Emotions',
            icon : 'ion-edit'
        },
        {
            title : 'History',
            isSubMenuChild : true,
            showSubMenuVariable : 'showEmotionsSubMenu',
            href : '#/app/history-all/Emotions',
            icon : 'ion-ios-paper-outline'
        },
        {
            title : 'Diet',
            click : 'toggleDietSubMenu',
            showSubMenuVariable : 'showDietSubMenu',
            isSubMenuParent : true,
            collapsedIcon : 'ion-ios-nutrition-outline',
            expandedIcon : 'ion-chevron-down'
        },
        {
            title : 'Manage Reminders',
            isSubMenuChild : true,
            showSubMenuVariable : 'showDietSubMenu',
            href : '#/app/reminders-manage/Foods',
            icon : 'ion-android-notifications-none'
        },
        {
            title : 'Record Meal',
            isSubMenuChild : true,
            showSubMenuVariable : 'showDietSubMenu',
            href : '#/app/track_factors_category/Foods',
            icon : 'ion-edit'
        },
        {
            title : 'History',
            isSubMenuChild : true,
            showSubMenuVariable : 'showDietSubMenu',
            href : '#/app/history-all/Foods',
            icon : 'ion-ios-paper-outline'
        },
        {
            title : 'Symptoms',
            click : 'toggleSymptomsSubMenu',
            icon : 'ion-ios-pulse',
            isSubMenuParent : true,
            showSubMenuVariable : 'showSymptomsSubMenu',
            collapsedIcon : 'ion-ios-pulse',
            expandedIcon : 'ion-chevron-down'
        },
        {
            title : 'Manage Reminders',
            isSubMenuChild : true,
            showSubMenuVariable : 'showSymptomsSubMenu',
            href : '#/app/reminders-manage/Symptoms',
            icon : 'ion-android-notifications-none'
        },
        {
            title : 'Rate Symptom',
            isSubMenuChild : true,
            showSubMenuVariable : 'showSymptomsSubMenu',
            href : '#/app/track_factors_category/Symptoms',
            icon : 'ion-edit'
        },
        {
            title : 'History',
            isSubMenuChild : true,
            showSubMenuVariable : 'showSymptomsSubMenu',
            href : '#/app/history-all/Symptoms',
            icon : 'ion-ios-paper-outline'
        },
        {
            title : 'Treatments',
            click : 'toggleTreatmentsSubMenu',
            icon : 'ion-ios-pulse',
            showSubMenuVariable : 'showTreatmentsSubMenu',
            isSubMenuParent : true,
            collapsedIcon : 'ion-ios-medkit-outline',
            expandedIcon : 'ion-chevron-down'
        },
        {
            title : 'Overdue',
            isSubMenuChild : true,
            showSubMenuVariable : 'showTreatmentsSubMenu',
            href : '#/app/reminders-inbox/Treatments',
            icon : 'ion-clock'
        },
        {
            title : 'Today',
            isSubMenuChild : true,
            showSubMenuVariable : 'showTreatmentsSubMenu',
            href : '#/app/reminders-inbox-today/Treatments',
            icon : 'ion-android-sunny'
        },
        {
            title : 'Manage Reminders',
            isSubMenuChild : true,
            showSubMenuVariable : 'showTreatmentsSubMenu',
            href : '#/app/reminders-manage/Treatments',
            icon : 'ion-android-notifications-none'
        },
        {
            title : 'Record Treatment',
            isSubMenuChild : true,
            showSubMenuVariable : 'showTreatmentsSubMenu',
            href : '#/app/track_factors_category/Treatments',
            icon : 'ion-edit'
        },
        {
            title : 'History',
            isSubMenuChild : true,
            showSubMenuVariable : 'showTreatmentsSubMenu',
            href : '#/app/history-all/Treatments',
            icon : 'ion-ios-paper-outline'
        },
        {
            title : 'Physical Activity',
            click : 'togglePhysicalActivitySubMenu',
            icon : 'ion-ios-pulse',
            showSubMenuVariable : 'showPhysicalActivitySubMenu',
            isSubMenuParent : true,
            collapsedIcon : 'ion-ios-body-outline',
            expandedIcon : 'ion-chevron-down'
        },
        {
            title : 'Manage Reminders',
            isSubMenuChild : true,
            showSubMenuVariable : 'showPhysicalActivitySubMenu',
            href : '#/app/reminders-manage/Physical Activity',
            icon : 'ion-android-notifications-none'
        },
        {
            title : 'Record Activity',
            isSubMenuChild : true,
            showSubMenuVariable : 'showPhysicalActivitySubMenu',
            href : '#/app/track_factors_category/Physical Activity',
            icon : 'ion-edit'
        },
        {
            title : 'History',
            isSubMenuChild : true,
            showSubMenuVariable : 'showPhysicalActivitySubMenu',
            href : '#/app/history-all/Physical Activity',
            icon : 'ion-ios-paper-outline'
        },
        {
            title : 'All Measurements',
            isSubMenuChild : true,
            showSubMenuVariable : 'showHistorySubMenu',
            href : '#/app/history-all',
            icon : 'ion-ios-paper-outline'
        },
        {
            title : 'Import Data',
            href : '#/app/import',
            icon : 'ion-ios-cloud-download-outline'
        },
        {
            title : 'Variables',
            href : '#app/search-variables',
            icon : 'ion-social-vimeo'
        },
        {
            title : 'All Measurements',
            isSubMenuChild : true,
            showSubMenuVariable : 'showHistorySubMenu',
            href : '#/app/history-all',
            icon : 'ion-ios-paper-outline'
        },
        {
            title : 'Predictor Search',
            click : 'togglePredictorSearchSubMenu',
            showSubMenuVariable : 'showPredictorSearchSubMenu',
            isSubMenuParent : true,
            collapsedIcon : 'ion-chevron-right',
            expandedIcon : 'ion-chevron-down'
        },
        {
            title : 'Common',
            isSubMenuChild : true,
            showSubMenuVariable : 'showPredictorSearchSubMenu',
            href : '#/app/search-common-relationships',
            icon : 'ion-ios-people'
        },
        {
            title : 'Yours',
            isSubMenuChild : true,
            showSubMenuVariable : 'showPredictorSearchSubMenu',
            href : '#/app/search-user-relationships',
            icon : 'ion-person'
        },
        {
            title : 'Settings',
            href : '#/app/settings',
            icon : 'ion-ios-gear-outline'
        },
        {
            title : 'Help & Feedback',
            href : window.chrome ? "mailto:help@quantimo.do" : "#app/feedback",
            icon : 'ion-ios-help-outline'
        }
    ]
};

config.getEnv = function(){

    var env = "";

    if(window.location.origin.indexOf('local')> -1){
        //On localhost
        env = "Development";
    }
    else if(window.location.origin.indexOf('file://')){
        env = this.environment;
    }
    else if(window.location.origin.indexOf('staging.quantimo.do') > -1){
        env = "Staging";
    }
    else if(window.location.origin.indexOf('app.quantimo.do')){
        env = "Production";
    }

    return env;
};

config.getClientId = function(){
    //if chrome app
    if (window.chrome && chrome.runtime && chrome.runtime.id) {
        return window.private_keys.client_ids.Chrome;
    } else {
        var platform = getPlatform();
        return platform === "Ionic"? window.private_keys.client_ids.Web : platform === "Web"? window.private_keys.client_ids.Web : platform === "iOS"? window.private_keys.client_ids.iOS : window.private_keys.client_ids.Android;
    }
};

config.getClientSecret = function(){
    if (window.chrome && chrome.runtime && chrome.runtime.id) {
        return window.private_keys.client_secrets.Chrome;
    } else {
        var platform = getPlatform();
        return platform === "Ionic"? window.private_keys.client_secrets.Web : platform === "Web"? window.private_keys.client_secrets.Web : platform === "iOS"? window.private_keys.client_secrets.iOS : window.private_keys.client_secrets.Android;
    }
};

config.getRedirectUri = function(){
    if(!window.private_keys.redirect_uris){
        return 'https://app.quantimo.do/ionic/Modo/www/callback/';
    }
    if (window.chrome && chrome.runtime && chrome.runtime.id) {
        return window.private_keys.redirect_uris.Chrome;
    } else {
        var platform = getPlatform();
        return platform === "Ionic"? window.private_keys.redirect_uris.Web : platform === "Web"? window.private_keys.redirect_uris.Web : platform === "iOS"? window.private_keys.redirect_uris.iOS : window.private_keys.redirect_uris.Android;
    }
};

config.getApiUrl = function(){
    if(!window.private_keys.api_urls){
        return 'https://app.quantimo.do';
    }
    var platform = getPlatform();
    if (window.chrome && chrome.runtime && chrome.runtime.id) {
        return window.private_keys.api_urls.Chrome;
    } else if (platform === 'Web' && window.private_keys.client_ids.Web === 'oAuthDisabled') {
        return window.location.origin;
    } else {
        return platform === "Ionic"? window.private_keys.api_urls.Web : platform === "Web"? window.private_keys.api_urls.Web : platform === "iOS"? window.private_keys.api_urls.iOS : window.private_keys.api_urls.Android;
    }
};

config.getAllowOffline = function(){
    return true;
};

config.getPermissionString = function(){

    var str = "";
    for(var i=0; i < config.permissions.length; i++) {
        str += config.permissions[i] + "%20";
    }
    return str.replace(/%20([^%20]*)$/,'$1');

};


config.getURL = function(path){
    if(typeof path === "undefined") {
        path = "";
    }
    else {
        path += "?";
    }

    var url = "";

    if(config.getApiUrl() !== "undefined") {
        url = config.getApiUrl() + "/" + path;
    }
    else
    {
        url = config.protocol + "://" + config.domain + "/" + path;
    }

   return url;
};

config.get = function(key){
	return config[key]? config[key] : false;
};


window.notification_callback = function(reportedVariable, reportingTime){
    var reportTime  = Math.floor(reportingTime/1000) || Math.floor(new Date().getTime()/1000);
    var keyIdentifier = config.appSettings.appStorageIdentifier;
    var val = false;

    // convert values
    if(reportedVariable === "repeat_rating"){
        val = localStorage[keyIdentifier+'lastReportedPrimaryOutcomeVariableValue']?
        JSON.parse(localStorage[keyIdentifier+'lastReportedPrimaryOutcomeVariableValue']) : false;
    } else {
        val = config.appSettings.primaryOutcomeValueConversionDataSetReversed[reportedVariable]?
        config.appSettings.primaryOutcomeValueConversionDataSetReversed[reportedVariable] : false;
    }

    // report
    if(val){
        // update localstorage
        localStorage[keyIdentifier+'lastReportedPrimaryOutcomeVariableValue'] = val;

        var allMeasurementsObject = {
            storedValue : val,
            value : val,
            startTime : reportTime,
            humanTime : {
                date : new Date().toISOString()
            }
        };

        // update full data
        if(localStorage[keyIdentifier+'allMeasurements']){
            var allMeasurements = JSON.parse(localStorage[keyIdentifier+'allMeasurements']);
            allMeasurements.push(allMeasurementsObject);
            localStorage[keyIdentifier+'allMeasurements'] = JSON.stringify(allMeasurements);
        }

        // update Bar chart data
        if(localStorage[keyIdentifier+'barChartData']){
            var barChartData = JSON.parse(localStorage[keyIdentifier+'barChartData']);
            barChartData[val-1]++;
            localStorage[keyIdentifier+'barChartData'] = JSON.stringify(barChartData);
        }

        // update Line chart data
        if(localStorage[keyIdentifier+'lineChartData']){
            var lineChartData = JSON.parse(localStorage[keyIdentifier+'lineChartData']);
            lineChartData.push([reportTime, val]);
            localStorage[keyIdentifier+'lineChartData'] = JSON.stringify(lineChartData);
        }

        //update measurementsQueue
        if(!localStorage[keyIdentifier+'measurementsQueue']){
            localStorage[keyIdentifier+'measurementsQueue'] = '[]';
        } else {
            var measurementsQueue = JSON.parse(localStorage[keyIdentifier+'measurementsQueue']);
            measurementsQueue.push(allMeasurementsObject);
            localStorage[keyIdentifier+'measurementsQueue'] = JSON.stringify(measurementsQueue);
        }
    }
};