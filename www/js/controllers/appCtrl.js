angular.module('starter')
    // Parent Controller
    // This controller runs before every one else
	.controller('AppCtrl', function($scope, $timeout, $ionicPopover, $ionicLoading, $state, $ionicHistory, $rootScope,
                                    $ionicPopup, $ionicSideMenuDelegate, $ionicPlatform,
                                    measurementService, QuantiModo, notificationService, localStorageService,
                                    reminderService, ratingService, migrationService, ionicDatePicker, unitService,
                                    variableService, qmLocationService, variableCategoryService, bugsnagService,
                                    utilsService, correlationService, $ionicActionSheet, $ionicDeploy) {

        $rootScope.loaderImagePath = config.appSettings.loaderImagePath;
        $rootScope.appMigrationVersion = 1489;
        $rootScope.appVersion = "2.2.4.0";
        if (!$rootScope.loaderImagePath) {
            $rootScope.loaderImagePath = 'img/circular_loader.gif';
        }
        if($rootScope.user && typeof $rootScope.user.trackLocation === "undefined"){
            localStorageService.getItem('trackLocation', function(trackLocation){
                $rootScope.user.trackLocation = trackLocation;
                if($rootScope.user.trackLocation){
                    QuantiModo.updateUserSettingsDeferred({trackLocation: $rootScope.user.trackLocation});
                }
            });
        }
        $rootScope.placeName = null;
        $rootScope.lastLatitude = null;
        $rootScope.lastLongitude = null;
        $scope.controller_name = "AppCtrl";
        $scope.menu = config.appSettings.menu;
        $rootScope.appSettings = config.appSettings;
        if(!$rootScope.appSettings.ionNavBarClass){
            $rootScope.appSettings.ionNavBarClass = "bar-positive";
        }
        $scope.showTrackingSubMenu = false;
        $rootScope.allowOffline = config.appSettings.allowOffline;
        $rootScope.numberOfPendingNotifications = null;
        $scope.showReminderSubMenu = false;
        $scope.primaryOutcomeVariableDetails = config.appSettings.primaryOutcomeVariableDetails;
        $rootScope.appName = config.appSettings.appName;

        // Not used
        //$scope.ratingInfo = ratingService.getRatingInfo();
        $scope.closeMenu = function () {
            $ionicSideMenuDelegate.toggleLeft(false);
        };
        $scope.floatingMaterialButton = config.appSettings.floatingMaterialButton;
        $rootScope.unitsIndexedByAbbreviatedName = [];
        $rootScope.abbreviatedUnitNamesIndexedByUnitId = [];

        //  Calendar and  Date picker
        // will update from showCalendarPopup
        $scope.fromDate = new Date();
        $scope.toDate = new Date();

        // "from" datepicker config
        $scope.fromDatePickerObj = {
            callback: function (val) {
                if (typeof(val) === 'undefined') {
                    console.debug('Date not selected');
                } else {
                    $scope.fromDate = new Date(val);
                    $scope.saveDates();
                }
            },
            inputDate: $scope.fromDate, // previously selected value
            from: new Date(2012, 8, 1),
            to: $scope.toDate // don't allow fromDate to be after toDate
        };

        // "to" datepicker config
        $scope.toDatePickerObj = {
            callback: function (val) {
                if (typeof(val) === 'undefined') {
                    console.debug('Date not selected');
                } else {
                    $scope.toDate = new Date(val);
                    $scope.saveDates();
                }
            },
            inputDate: $scope.toDate, // previously selected value
            from: $scope.fromDate, // don't allow toDate to be after fromDate
            to: new Date() //today
        };

        $scope.goToVariableSettingsForCauseVariable = function(correlationObject) {
            var stateParams = {};
            if(correlationObject.causeVariable){
                stateParams.variableObject = correlationObject.causeVariable;
            } else {
                stateParams.variableName = correlationObject.causeVariableName;
            }
            $state.go('app.variableSettings', stateParams);
        };

        $scope.goToVariableSettingsForEffectVariable = function(correlationObject) {
            var stateParams = {};
            if(correlationObject.effectVariable){
                stateParams.variableObject = correlationObject.effectVariable;
            } else {
                stateParams.variableName = correlationObject.effectVariableName;
            }
            $state.go('app.variableSettings', stateParams);
        };

        $scope.goToState = function (state, stateParameters) {
            if(!stateParameters){
                stateParameters = {};
            }
            stateParameters.fromState = $state.current.name;
            stateParameters.fromUrl = window.location.href;
            $state.go(state, stateParameters);
        };

        $scope.openUrl = function(url){
            if(typeof cordova !== "undefined"){
                cordova.InAppBrowser.open(url,'_blank', 'location=no,toolbar=yes,clearcache=no,clearsessioncache=no');
            } else {
                window.open(url,'_blank', 'location=no,toolbar=yes,clearcache=yes,clearsessioncache=yes');
            }
        };

        $scope.shareStudy = function(correlationObject, url){
            if(url.indexOf('userId') !== -1){
                if(!correlationObject.shareUserMeasurements){
                    $scope.showShareStudyConfirmation(correlationObject, url);
                } else {
                    $scope.openUrl(url);
                }
            } else {
                $scope.openUrl(url);
            }
        };

        $scope.showShareStudyConfirmation = function(correlationObject, url) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Share Study',
                template: 'Are you absolutely sure you want to make your ' + correlationObject.causeVariableName +
                ' and ' + correlationObject.effectVariableName + ' measurements publicly visible? <br><br> You can ' +
                'make them private again at any time on this study page.'
            });

            confirmPopup.then(function(res) {
                if(res) {
                    correlationObject.shareUserMeasurements = true;
                    var body = {
                        causeVariableId: correlationObject.causeVariableId,
                        effectVariableId: correlationObject.effectVariableId,
                        shareUserMeasurements: true
                    };
                    QuantiModo.postStudyDeferred(body).then(function () {
                        if(url){
                            $scope.openUrl(url);
                        }
                    }, function (error) {
                        console.error(error);

                    });
                } else {
                    correlationObject.shareUserMeasurements = false;
                    console.log('You are not sure');
                }
            });
        };


        $scope.showUnshareStudyConfirmation = function(correlationObject) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Share Study',
                template: 'Are you absolutely sure you want to make your ' + correlationObject.causeVariableName +
                ' and ' + correlationObject.effectVariableName + ' measurements private? <br><br> Links to studies you ' +
                'previously shared with these variable will no longer work.'
            });

            confirmPopup.then(function(res) {
                if(res) {
                    correlationObject.shareUserMeasurements = false;
                    var body = {
                        causeVariableId: correlationObject.causeVariableId,
                        effectVariableId: correlationObject.effectVariableId,
                        shareUserMeasurements: false
                    };
                    QuantiModo.postStudyDeferred(body).then(function () {

                    }, function (error) {
                        console.error(error);
                    });
                } else {
                    correlationObject.shareUserMeasurements = true;
                    console.log('You are not sure');
                }
            });
        };


        $scope.toggleStudyShare = function (correlationObject) {
            if(correlationObject.shareUserMeasurements){
                $scope.showShareStudyConfirmation(correlationObject);
            } else {
                $scope.showUnshareStudyConfirmation(correlationObject);
            }
        };

        $rootScope.setLocalStorageFlagTrue = function (flagName) {
            console.debug('Set ' + flagName + ' to true');
            $rootScope[flagName] = true;
            localStorageService.setItem(flagName, true);
        };

        $rootScope.hideHelpCard = function (card) {
            card.hide = true;
            $rootScope.defaultHelpCards = $rootScope.defaultHelpCards.filter(function( obj ) {
                return obj.id !== card.id;
            });
            localStorageService.deleteElementOfItemById('defaultHelpCards', card.id);
        };

        // open datepicker for "from" date
        $scope.openFromDatePicker = function () {
            ionicDatePicker.openDatePicker($scope.fromDatePickerObj);
        };

        // open datepicker for "to" date
        $scope.openToDatePicker = function () {
            ionicDatePicker.openDatePicker($scope.toDatePickerObj);
        };

        // update dates selected from calendar
        $scope.saveDates = function () {
            $scope.updateDatesLocalStorage();
            $scope.updateDatePickerObjects();
            $scope.popover.hide();
            $scope.init();
        };

        // update fromDate and toDate in datepicker objects
        $scope.updateDatePickerObjects = function () {
            $scope.fromDatePickerObj.to = $scope.toDate;
            $scope.toDatePickerObj.from = $scope.fromDate;
            $scope.fromDatePickerObj.inputDate = $scope.fromDate;
            $scope.toDatePickerObj.inputDate = $scope.toDate;
        };

        $scope.updateDatesLocalStorage = function () {
            var to = moment($scope.toDate).unix() * 1000;
            var from = moment($scope.fromDate).unix() * 1000;
            console.debug("$scope.updateDatesLocalStorage is calling measurementService.setDates");
            measurementService.setDates(to, from);
        };

        // show main calendar popup (from and to)
        $scope.showCalendarPopup = function ($event) {
            $scope.popover.show($event);
            measurementService.getToDate(function (endDate) {
                $scope.toDate = new Date(endDate);
                $scope.fromDatePickerObj.to = $scope.toDate;
                measurementService.getFromDate(function (fromDate) {
                    $scope.fromDate = new Date(fromDate);
                    $scope.toDatePickerObj.from = $scope.fromDate;
                });
            });
        };

        var helpPopupMessages = config.appSettings.helpPopupMessages || false;

        $scope.showHelpInfoPopup = function () {
            $rootScope.helpPopup = $ionicPopup.show({
                title: helpPopupMessages[location.hash],
                subTitle: '',
                scope: $scope,
                template: '<label><input type="checkbox" ng-model="$parent.notShowHelpPopup" class="show-again-checkbox">Don\'t show these tips</label>',
                buttons: [
                    {
                        text: 'OK',
                        type: 'button-positive',
                        onTap: function () {
                            localStorageService.setItem('notShowHelpPopup', JSON.stringify($scope.notShowHelpPopup));
                        }
                    }
                ]
            });
        };

        $scope.onGenericHelpButtonPress = function () {
            $state.go('app.help');
        };

        $scope.onHelpButtonPress = function () {
            $rootScope.helpButtonPopup = $ionicPopup.show({
                title: $rootScope.stateParams.title,
                subTitle: $rootScope.stateParams.helpText,
                scope: $scope,
                template: '',
                buttons: [
                    {
                        text: 'OK',
                        type: 'button-positive'
                    },
                    {
                        text: 'More Help',
                        type: 'button-positive',
                        onTap: function(e) {
                            $state.go('app.help');
                        }
                    }
                ]
            });
        };

        $scope.addTag = function () {
            $state.go('app.tagSearch',  {
                fromState: $state.current.name,
                taggedVariableObject: $rootScope.variableObject
            });
        };

        $scope.tagAnotherVariable = function () {
            $state.go('app.tageeSearch',  {
                fromState: $state.current.name,
                tagVariableObject: $rootScope.variableObject
            });
        };

        $scope.showHelpInfoPopupIfNecessary = function (e) {
            localStorageService.getItem('isWelcomed', function (isWelcomed) {
                if (isWelcomed === true || isWelcomed === "true") {
                    if (helpPopupMessages && typeof helpPopupMessages[location.hash] !== "undefined") {
                        localStorageService.getItem('notShowHelpPopup', function (val) {
                            if (typeof val === "undefined" || val === "undefined") {
                                $scope.notShowHelpPopup = false;
                            } else {
                                $scope.notShowHelpPopup = val ? JSON.parse(val) : false;
                            }

                            // Had to add "&& e.targetScope !== $scope" to prevent duplicate popups
                            //if (!$scope.notShowHelpPopup && e.targetScope !== $scope) {
                            if (!$scope.notShowHelpPopup) {
                                $scope.showHelpInfoPopup();
                            }
                        });
                    }
                }
            });
        };

        $scope.goToAddMeasurementForVariableObject = function (variableObject) {
            $state.go('app.measurementAdd',
                {
                    variableObject: variableObject,
                    fromState: $state.current.name,
                    fromUrl: window.location.href
                });
        };

        $scope.goToHistoryForVariableObject = function (variableObject) {
            $state.go('app.historyAllVariable',
                {
                    variableObject: variableObject
                });
        };

        $scope.goToChartsPageForVariableObject = function (variableObject) {
            $state.go('app.charts',
                {
                    variableObject: variableObject,
                    fromState: $state.current.name,
                    fromUrl: window.location.href
                });
        };

        $scope.goToAddReminderForVariableObject = function (variableObject) {
            $state.go('app.reminderAdd',
                {
                    variableObject: variableObject,
                    fromState: $state.current.name,
                    fromUrl: window.location.href
                });
        };

        $scope.addToFavoritesUsingVariableObject = function (variableObject) {
            var trackingReminder = {};
            trackingReminder.variableId = variableObject.id;
            trackingReminder.reminderFrequency = 0;
            trackingReminder.variableName = variableObject.name;
            trackingReminder.abbreviatedUnitName = variableObject.abbreviatedUnitName;
            trackingReminder.variableDescription = variableObject.description;
            trackingReminder.variableCategoryName = variableObject.variableCategoryName;

            if($rootScope.lastRefreshTrackingRemindersAndScheduleAlarmsPromise){
                var message = 'Got deletion request before last reminder refresh completed';
                console.debug(message);
                $rootScope.lastRefreshTrackingRemindersAndScheduleAlarmsPromise.reject();
                $rootScope.lastRefreshTrackingRemindersAndScheduleAlarmsPromise = null;
                $rootScope.syncingReminders = false;
            }

            if (trackingReminder.abbreviatedUnitName === '/5' || trackingReminder.variableName === "Blood Pressure") {
                $ionicLoading.show({
                    template: '<ion-spinner></ion-spinner>'
                });
                //trackingReminder.defaultValue = 3;
                localStorageService.addToOrReplaceElementOfItemByIdOrMoveToFront('trackingReminders', trackingReminder)
                    .then(function() {
                        // We should wait unit this is in local storage before going to Favorites page so they don't see a blank screen
                        $state.go('app.favorites',
                            {
                                trackingReminder: trackingReminder,
                                fromState: $state.current.name,
                                fromUrl: window.location.href
                            }
                        );
                        reminderService.postTrackingReminders(trackingReminder)
                            .then(function () {
                                $ionicLoading.hide();
                                console.debug("Saved to favorites: " + JSON.stringify(trackingReminder));
                            }, function(error) {
                                $ionicLoading.hide();
                                console.error('Failed to add favorite!' + JSON.stringify(error));
                            });
                    });

            } else {
                $state.go('app.favoriteAdd',
                    {
                        variableObject: variableObject,
                        fromState: $state.current.name,
                        fromUrl: window.location.href
                    }
                );
            }
        };

        $scope.closeMenuIfNeeded = function (menuItem) {
            if (menuItem.click) {
                $scope[menuItem.click] && $scope[menuItem.click]();
            } else if (!menuItem.isSubMenuParent) {
                $scope.closeMenu();
            }
        };
        $scope.showHistorySubMenu = false;
        $scope.shoppingCartEnabled = config.appSettings.shoppingCartEnabled;
        $scope.loading = false;
        $ionicLoading.hide();

        utilsService.setPlatformVariables();

        /*Wrapper Config*/
        $scope.viewTitle = config.appSettings.appName;
        $scope.primaryOutcomeVariable = config.appSettings.primaryOutcomeVariable;
        $scope.positiveRatingOptions = ratingService.getPositiveRatingOptions();
        $scope.negativeRatingOptions = ratingService.getNegativeRatingOptions();
        $scope.numericRatingOptions = ratingService.getNumericRatingOptions();
        $scope.welcomeText = config.appSettings.welcomeText;
        $scope.primaryOutcomeVariableTrackingQuestion = config.appSettings.primaryOutcomeVariableTrackingQuestion;
        $scope.primaryOutcomeVariableAverageText = config.appSettings.primaryOutcomeVariableAverageText;
        /*Wrapper Config End*/



        // when view is changed
        $scope.$on('$ionicView.enter', function (e) {
            //$scope.showHelpInfoPopupIfNecessary(e);
            if (e.targetScope && e.targetScope.controller_name && e.targetScope.controller_name === "TrackPrimaryOutcomeCtrl") {
                $scope.showCalendarButton = true;
            } else {
                $scope.showCalendarButton = false;
            }

            // Show "..." button on top rigt
            if (e.targetScope && e.targetScope.controller_name &&
                e.targetScope.controller_name === "MeasurementAddCtrl" ||
                e.targetScope.controller_name === "RemindersAddCtrl" ||
                e.targetScope.controller_name === "FavoriteAddCtrl" ||
                e.targetScope.controller_name === "ChartsPageCtrl" ||
                e.targetScope.controller_name === "VariableSettingsCtrl" ||
                e.targetScope.controller_name === "RemindersInboxCtrl" ||
                e.targetScope.controller_name === "RemindersManageCtrl" ||
                e.targetScope.controller_name === "StudyCtrl"
            ) {
                $scope.showMoreMenuButton = true;
            } else {
                $scope.showMoreMenuButton = false;
            }
        });

        // when view is changed
        $scope.$on('$ionicView.afterEnter', function (e) {
            qmLocationService.updateLocationVariablesAndPostMeasurementIfChanged();
        });


        $scope.highchartsReflow = function() {
            // Fixes chart width
            //$(window).resize(); This doesn't seem to do anything

            if(!$rootScope.reflowScheduled){
                $rootScope.reflowScheduled = true; // Avoids Error: [$rootScope:inprog] $digest already in progress
                var seconds = 0.1;
                console.debug('Setting highchartsReflow timeout for ' + seconds + ' seconds');
                $timeout(function() {
                    console.debug('executing broadcast(highchartsng.reflow)');
                    $scope.$broadcast('highchartsng.reflow');
                    $rootScope.reflowScheduled = false;
                }, seconds * 1000);

                //$scope.$broadcast('highchartsng.reflow'); This doesn't seem to do anything
            } else {
                console.debug('broadcast(highchartsng.reflow) already scheduled');
            }

        };

        $scope.updateApp = function () {
            var message;
            if(!$rootScope.isMobile){
                console.debug("Cannot update app because platform is not mobile");
                return;
            }
            $ionicPlatform.ready(function () {
                if($rootScope.user && $rootScope.user.getPreviewBuilds){
                    $ionicDeploy.channel = 'staging';
                } else {
                    $ionicDeploy.channel = 'production';
                    message = 'Not updating because user is not signed up for preview builds';
                    console.debug(message);
                    if (typeof Bugsnag !== "undefined") { Bugsnag.notify(message, message, {}, "error"); }
                    return;
                }
                console.debug('Checking for new snapshot');
                $scope.showLoader('Checking something...');
                
                $timeout(function () {
                    $scope.hideLoader();
                }, 60 * 1000);
                $ionicDeploy.check().then(function(snapshotAvailable) {
                    if (snapshotAvailable) {
                        message = 'New snapshot available';
                        console.debug(message);
                        if (typeof Bugsnag !== "undefined") { Bugsnag.notify(message, message, {}, "error"); }
                        // When snapshotAvailable is true, you can apply the snapshot
                        $scope.showLoader('Downloading...');
                        $ionicDeploy.download().then(function() {
                            message = 'Downloaded new version';
                            console.debug(message);
                            if (typeof Bugsnag !== "undefined") { Bugsnag.notify(message, message, {}, "error"); }
                            /*$ionicPopup.alert({
                                title: 'Registration Successful',
                                //template: "Wait a few seconds for extract and restart app to update."
                            });*/
                            $scope.showLoader('Extracting...');
                            return $ionicDeploy.extract();
                        });
                    } else {
                        /*$ionicPopup.alert({
                            title: 'Not Updating',
                            template: "No new snapshot available"
                        });*/
                        $scope.showLoader('No new downloads');
                        message = 'No new snapshot available';
                        console.debug(message);
                        if (typeof Bugsnag !== "undefined") { Bugsnag.notify(message, message, {}, "error"); }
                    }
                });
            });
        };

        $scope.updateApp();

        $ionicPopover.fromTemplateUrl('templates/popover.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.popover = popover;
        });

        // when work on this activity is complete
        $rootScope.hideNavigationMenuIfSetInUrlParameter = function() {
            if (location.href.toLowerCase().indexOf('hidemenu=true') !== -1) {
                $rootScope.hideNavigationMenu = true;
            } else {
                $rootScope.hideNavigationMenu = false;
            }
        };

        function goToDefaultStateShowMenuClearIntroHistoryAndRedraw() {

            if ($state.current.name === "app.welcome") {
                $rootScope.hideNavigationMenu = false;
                console.debug('goToDefaultStateShowMenuClearIntroHistoryAndRedraw: Going to default state...');
                $state.go(config.appSettings.defaultState);
            }

            if ($state.current.name === "app.login" && $rootScope.user) {
                $rootScope.hideNavigationMenu = false;
                console.debug('goToDefaultStateShowMenuClearIntroHistoryAndRedraw: Going to default state...');
                $state.go(config.appSettings.defaultState);
            }

            if (config.appSettings.allowOffline) {
                console.debug('goToDefaultStateShowMenuClearIntroHistoryAndRedraw: Going to default state...');
                $rootScope.hideNavigationMenu = false;
                $state.go(config.appSettings.defaultState);
            }

            // don't animate, clear back history
            $ionicHistory.nextViewOptions({
                disableAnimate: false,
                disableBack: true
            });

            // redraw everything according to updated appstate
            measurementService.syncPrimaryOutcomeVariableMeasurements();
        }

        $scope.goToDefaultStateIfWelcomed = function () {
            console.debug('appCtrl: user has seen the welcome screen before...');
            localStorageService.getItem('isWelcomed', function (isWelcomed) {
                if (isWelcomed === true || isWelcomed === "true") {
                    $rootScope.isWelcomed = true;
                    console.debug('goToDefaultStateIfWelcomed: Going to default state...');
                    goToDefaultStateShowMenuClearIntroHistoryAndRedraw();
                }
            });
        };

        var goToDefaultStateIfLoggedInOnLoginState = function () {
            var loginState = 'app.login';
            if (loginState.indexOf($state.current.name) !== -1 && $rootScope.user) {
                $rootScope.hideNavigationMenu = false;
                console.debug('goToDefaultStateIfLoggedInOnLoginState: Going to default state. $state.current.name is ' +
                    $state.current.name);
                $state.go(config.appSettings.defaultState);
            }
        };

        $scope.editTag = function(tagVariable){
            $state.go('app.tagAdd', {
                tagConversionFactor: tagVariable.tagConversionFactor,
                taggedVariableObject: $rootScope.variableObject,
                fromState: $state.current.name,
                tagVariableObject: tagVariable,
                variableObject: $rootScope.variableObject,
                fromStateParameters: {variableName: $rootScope.variableObject.name}
            });
        };

        $scope.editTagged = function(taggedVariable){
            $state.go('app.tagAdd', {
                tagConversionFactor: taggedVariable.tagConversionFactor,
                taggedVariableObject: taggedVariable,
                fromState: $state.current.name,
                tagVariableObject: $rootScope.variableObject,
                variableObject: $rootScope.variableObject,
                fromStateParameters: {variableName: $rootScope.variableObject.name}
            });
        };

        $scope.$on('getFavoriteTrackingRemindersFromLocalStorage', function(){
            QuantiModo.getFavoriteTrackingRemindersFromLocalStorage($rootScope.variableCategoryName);
        });

        $scope.init = function () {
            console.debug("Main Constructor Start");
            if(!window.private_keys) {
                console.error('Please add private config file to www/private_configs folder!  Contact mike@quantimo.do if you need help');
            }

            if($rootScope.showUndoButton){
                $rootScope.showUndoButton = false;
            }

            $rootScope.favoritesOrderParameter = 'numberOfRawMeasurements';
            
            if($rootScope.urlParameters.refreshUser){
                localStorageService.clear();
                window.localStorage.introSeen = true;
                window.localStorage.isWelcomed = true;
                $rootScope.user = null;
                $rootScope.refreshUser = false;
            }
            bugsnagService.setupBugsnag();
            QuantiModo.getAccessTokenFromUrlParameter();
            $rootScope.hideNavigationMenuIfSetInUrlParameter();
            if(!$rootScope.user){
                $rootScope.user = JSON.parse(localStorageService.getItemSync('user'));
            }
            if(!$rootScope.user){
                QuantiModo.refreshUser().then(function(){
                    $scope.syncEverything();
                }, function(error){
                    console.error('AppCtrl.init could not refresh user because ' + JSON.stringify(error));
                });
            }

            if ($rootScope.isMobile && $rootScope.localNotificationsEnabled) {
                console.debug("Going to try setting on trigger and on click actions for notifications when device is ready");
                $ionicPlatform.ready(function () {
                    console.debug("Setting on trigger and on click actions for notifications");
                    notificationService.setOnTriggerAction();
                    notificationService.setOnClickAction(QuantiModo);
                    notificationService.setOnUpdateAction();
                });
            } else {
                //console.debug("Not setting on trigger and on click actions for notifications because is not ios or android.");
            }
            goToDefaultStateIfLoggedInOnLoginState();
        };

        $scope.$on('callAppCtrlInit', function () {
            console.debug("calling init");
            $scope.init();
        });

        $scope.togglePrimaryOutcomeSubMenu = function () {
            $scope.showPrimaryOutcomeSubMenu = !$scope.showPrimaryOutcomeSubMenu;
        };

        $scope.toggleEmotionsSubMenu = function () {
            $scope.showEmotionsSubMenu = !$scope.showEmotionsSubMenu;
        };

        $scope.toggleDietSubMenu = function () {
            $scope.showDietSubMenu = !$scope.showDietSubMenu;
        };

        $scope.toggleTreatmentsSubMenu = function () {
            $scope.showTreatmentsSubMenu = !$scope.showTreatmentsSubMenu;
        };

        $scope.toggleSymptomsSubMenu = function () {
            $scope.showSymptomsSubMenu = !$scope.showSymptomsSubMenu;
        };

        $scope.togglePhysicalActivitySubMenu = function () {
            $scope.showPhysicalActivitySubMenu = !$scope.showPhysicalActivitySubMenu;
        };

        $scope.toggleVitalSignsSubMenu = function () {
            $scope.showVitalSignsSubMenu = !$scope.showVitalSignsSubMenu;
        };

        $scope.toggleTrackingSubMenu = function () {
            $scope.showTrackingSubMenu = !$scope.showTrackingSubMenu;
        };

        $scope.togglePredictorSearchSubMenu = function () {
            $scope.showPredictorSearchSubMenu = !$scope.showPredictorSearchSubMenu;
        };

        $scope.toggleChartSearchSubMenu = function () {
            $scope.showChartSearchSubMenu = !$scope.showChartSearchSubMenu;
        };

        $scope.toggleOutcomePredictorSubMenu = function () {
            $scope.showOutcomePredictorSubMenu = !$scope.showOutcomePredictorSubMenu;
        };

        $scope.toggleHistorySubMenu = function () {
            $scope.showHistorySubMenu = !$scope.showHistorySubMenu;
        };

        $scope.toggleReminderSubMenu = function () {
            $scope.showReminderSubMenu = !$scope.showReminderSubMenu;
        };

        $rootScope.updateOrRecreateNotifications = function () {
            if($rootScope.localNotificationsEnabled){
                notificationService.updateOrRecreateNotifications();
            }
        };

        $scope.saveInterval = function(primaryOutcomeRatingFrequencyDescription){
            if(primaryOutcomeRatingFrequencyDescription){
                $scope.primaryOutcomeRatingFrequencyDescription = primaryOutcomeRatingFrequencyDescription;
            }

            var intervals = {
                "minutely" : 60,
                "every five minutes" : 5 * 60,
                "never" : 0,
                "hourly": 60 * 60,
                "hour": 60 * 60,
                "every three hours" : 3 * 60 * 60,
                "twice a day" : 12 * 60 * 60,
                "daily" : 24 * 60 * 60,
                "day" : 24 * 60 * 60
            };

            var reminderToSchedule = {
                reminderFrequency: intervals[$scope.primaryOutcomeRatingFrequencyDescription],
                variableId: config.appSettings.primaryOutcomeVariableDetails.id,
                defaultValue: 3
            };
            reminderService.addToTrackingReminderSyncQueue(reminderToSchedule);
            $scope.showIntervalCard = false;
        };

        $scope.downVote = function(correlationObject, $index){
            if (correlationObject.correlationCoefficient > 0) {
                $scope.increasesDecreases = "increases";
            } else {
                $scope.increasesDecreases = "decreases";
            }

            if (correlationObject.userVote !== 0) {
                $ionicPopup.show({
                    title:'Implausible relationship?',
                    subTitle: 'Do you think is is IMPOSSIBLE that ' + correlationObject.causeVariableName + ' ' + $scope.increasesDecreases + ' your ' + correlationObject.effect + '?',
                    scope: $scope,
                    template: $scope.templateConfirmationDown,
                    buttons:[
                        {text: 'No'},
                        {text: 'Yes',
                            type: 'button-positive',
                            onTap: function(){
                                correlationObject.userVote = 0;
                                correlationObject.vote = 0;
                                correlationService.vote(correlationObject)
                                    .then(function () {
                                        console.debug('Down voted!');
                                    }, function () {
                                        console.error('Down vote failed!');
                                    });
                            }
                        }
                    ]
                });
            } else {
                deleteVote(correlationObject, $index);
            }
        };


        $scope.upVote = function(correlationObject, $index){
            if (correlationObject.correlationCoefficient > 0) {
                $scope.increasesDecreases = "increases";
            } else {
                $scope.increasesDecreases = "decreases";
            }
            if (correlationObject.userVote !== 1) {
                $ionicPopup.show({
                    title:'Plausible relationship?',
                    subTitle: 'Do you think it is POSSIBLE that '+ correlationObject.causeVariableName + ' ' + $scope.increasesDecreases + ' your ' + correlationObject.effect + '?',
                    scope: $scope,
                    template: $scope.templateConfirmationUp,
                    buttons:[
                        {text: 'No'},
                        {text: 'Yes',
                            type: 'button-positive',
                            onTap: function(){
                                correlationObject.userVote = 1;
                                correlationObject.vote = 1;
                                correlationService.vote(correlationObject)
                                    .then(function () {
                                        console.debug('upVote');
                                    }, function () {
                                        console.error('upVote failed!');
                                    });
                            }
                        }
                    ]
                });
            } else {
                deleteVote(correlationObject, $index);
            }
        };

        function deleteVote(correlationObject, $index) {
            correlationObject.userVote = null;
            correlationService.deleteVote(correlationObject, function(response){
                console.debug("deleteVote response", response);
            }, function(response){
                console.error("deleteVote response", response);
            });
        }

        $rootScope.sendToLogin = function(){
            localStorageService.deleteItem('user');
            localStorageService.deleteItem('accessToken');
            localStorageService.deleteItem('accessTokenInUrl');
            $rootScope.accessToken = null;
            console.debug('appCtrl.sendToLogin just set $rootScope.user to null');
            $rootScope.user = null;
            $state.go('app.login');
        };

        $scope.safeApply = function(fn) {
            var phase = this.$root.$$phase;
            if(phase === '$apply' || phase === '$digest') {
                if(fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };

        $scope.showLoader = function (loadingText) {
            $rootScope.isSyncing = true;
            $rootScope.syncDisplayText = loadingText;
            console.debug('Showing Loader');
            if(!loadingText){
                loadingText = '';
            }
            $scope.loading = true;
/*            $ionicLoading.show({
                template: loadingText+ '<br><br><img src={{loaderImagePath}}>',
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: false,
                maxWidth: 1000,
                showDelay: 0,
                noBackdrop: true,
                hideOnStateChange: true,
                duration: 15000
            });
            */
            var seconds = 30;
            console.debug('Setting showLoader timeout for ' + seconds + ' seconds');
            $timeout(function () {
                $scope.hideLoader();
            }, seconds * 1000);

        };


        $scope.hideLoader = function () {
            $rootScope.isSyncing = false;
            $rootScope.syncDisplayText = '';
            $scope.loading = false;
            $ionicLoading.hide();
        };

        $scope.syncEverything = function () {
            if(!$rootScope.syncedEverything && $rootScope.user){
                console.debug('syncEverything for this user: ' + JSON.stringify($rootScope.user));
                //measurementService.syncPrimaryOutcomeVariableMeasurements();
                if($rootScope.localNotificationsEnabled){
                    console.debug("syncEverything: calling refreshTrackingRemindersAndScheduleAlarms");
                    reminderService.refreshTrackingRemindersAndScheduleAlarms();
                }
                variableService.getUserVariables();
                variableService.getCommonVariables();
                unitService.getUnits();
                $rootScope.syncedEverything = true;
                qmLocationService.updateLocationVariablesAndPostMeasurementIfChanged();
                reminderService.syncTrackingReminderSyncQueueToServer();
                //connectorsService.getConnectors();
            }
        };

        $scope.sendWithMailTo = function(subjectLine, emailBody, emailAddress, fallbackUrl){
            var emailUrl = 'mailto:';
            if(emailAddress){
                emailUrl = emailUrl + emailAddress;
            }
            emailUrl = emailUrl + '?subject=' + subjectLine + '&body=' + emailBody;
            if($rootScope.isChromeExtension){
                console.debug('isChromeExtension so sending to website');
                var newTab = window.open(fallbackUrl,'_blank');
                if(!newTab){
                    alert("Please unblock popups and refresh to access the Data Sharing page.");
                }
                $rootScope.hideNavigationMenu = false;
                $state.go(config.appSettings.defaultState);

            } else {
                console.debug('window.plugins.emailComposer not found!  Generating email normal way.');
                window.location.href = emailUrl;
            }
        };

        $scope.sendWithEmailComposer = function(subjectLine, emailBody, emailAddress, fallbackUrl){
            if(!cordova || !cordova.plugins.email){
                bugsnagService.reportError('Trying to send with cordova.plugins.email even though it is not installed. ' +
                    ' Using $scope.sendWithMailTo instead.');
                $scope.sendWithMailTo(subjectLine, emailBody, emailAddress, fallbackUrl);
                return;
            }

            if(!emailAddress){
                emailAddress = null;
            }

            document.addEventListener('deviceready', function () {
                console.debug('deviceready');
                cordova.plugins.email.isAvailable(
                    function (isAvailable) {
                        if(isAvailable){
                            if(window.plugins && window.plugins.emailComposer) {
                                console.debug('Generating email with cordova-plugin-email-composer');
                                window.plugins.emailComposer.showEmailComposerWithCallback(function(result) {
                                        console.debug("Response -> " + result);
                                    },
                                    subjectLine, // Subject
                                    emailBody,                      // Body
                                    emailAddress,    // To
                                    'info@quantimo.do',                    // CC
                                    null,                    // BCC
                                    true,                   // isHTML
                                    null,                    // Attachments
                                    null);                   // Attachment Data
                            } else {
                                console.error('window.plugins.emailComposer not available!');
                                $scope.sendWithMailTo(subjectLine, emailBody, emailAddress, fallbackUrl);
                            }
                        } else {
                            console.error('Email has not been configured for this device!');
                            $scope.sendWithMailTo(subjectLine, emailBody, emailAddress, fallbackUrl);
                        }
                    }
                );

            }, false);
        };

        $scope.onTextClick = function ($event) {
            console.debug("Auto selecting text so the user doesn't have to press backspace...");
            $event.target.select();
        };

        $scope.favoriteValidationFailure = function (message) {
            utilsService.showAlert(message);
            console.error(message);
            if (typeof Bugsnag !== "undefined") { Bugsnag.notify(message, message, {}, "error"); }
        };

        $scope.trackFavoriteByValueField = function(trackingReminder, $index){
            if($rootScope.favoritesArray[$index].total === null){
                $scope.favoriteValidationFailure('Please specify a value for ' + $rootScope.favoritesArray[$index].variableName);
                return;
            }
            $rootScope.favoritesArray[$index].displayTotal = "Recorded " + $rootScope.favoritesArray[$index].total + " " + $rootScope.favoritesArray[$index].abbreviatedUnitName;
            measurementService.postMeasurementByReminder($rootScope.favoritesArray[$index], $rootScope.favoritesArray[$index].total)
                .then(function () {
                    console.debug("Successfully measurementService.postMeasurementByReminder: " + JSON.stringify($rootScope.favoritesArray[$index]));
                }, function(error) {
                    if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
                    console.error(error);
                    console.error('Failed to Track by favorite, Try again!');
                });
        };

        $scope.trackByFavorite = function(trackingReminder, modifiedReminderValue){
            if(!modifiedReminderValue){
                modifiedReminderValue = trackingReminder.defaultValue;
            }
            console.debug('Tracking reminder', trackingReminder);
            console.debug('modifiedReminderValue is ' + modifiedReminderValue);
            for(var i = 0; i < $rootScope.favoritesArray.length; i++){
                if($rootScope.favoritesArray[i].id === trackingReminder.id){
                    if($rootScope.favoritesArray[i].abbreviatedUnitName !== '/5') {
                        if(trackingReminder.combinationOperation === "SUM"){
                            $rootScope.favoritesArray[i].total = $rootScope.favoritesArray[i].total + modifiedReminderValue;
                        } else {
                            $rootScope.favoritesArray[i].total = modifiedReminderValue;
                        }
                        $rootScope.favoritesArray[i].displayTotal = $rootScope.favoritesArray[i].total + " " + $rootScope.favoritesArray[i].abbreviatedUnitName;
                    } else {
                        $rootScope.favoritesArray[i].displayTotal = modifiedReminderValue + '/5';
                    }

                }
            }
            
            if(!$rootScope.favoritesTally){
                $rootScope.favoritesTally = {};
            }

            
            if(!$rootScope.favoritesTally[trackingReminder.id] || !$rootScope.favoritesTally[trackingReminder.id].tally){
                $rootScope.favoritesTally[trackingReminder.id] = {
                    tally: 0
                };
            }

            if(trackingReminder.combinationOperation === "SUM"){
                $rootScope.favoritesTally[trackingReminder.id].tally += modifiedReminderValue;
            } else {
                $rootScope.favoritesTally[trackingReminder.id].tally = modifiedReminderValue;
            }

            console.debug('modified tally is ' + $rootScope.favoritesTally[trackingReminder.id].tally);

            console.debug('Setting trackByFavorite timeout');
            $timeout(function() {
                if(typeof $rootScope.favoritesTally[trackingReminder.id] === "undefined"){
                    console.error("$rootScope.favoritesTally[trackingReminder.id] is undefined so we can't send tally in favorite controller. Not sure how this is happening.");
                    return;
                }
                if($rootScope.favoritesTally[trackingReminder.id].tally) {
                    measurementService.postMeasurementByReminder(trackingReminder, $rootScope.favoritesTally[trackingReminder.id].tally)
                        .then(function () {
                            console.debug("Successfully measurementService.postMeasurementByReminder: " + JSON.stringify(trackingReminder));
                        }, function(error) {
                            if (typeof Bugsnag !== "undefined") {
                                Bugsnag.notify(error, JSON.stringify(error), {}, "error");
                            }
                            console.error(error);
                            console.error('Failed to Track by favorite, Try again!');
                        });
                    $rootScope.favoritesTally[trackingReminder.id].tally = 0;
                }
            }, 2000);

        };

        $scope.deleteAllMeasurementsForVariable = function() {
            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner>'
            });
            // Delete all measurements for a variable
            variableService.deleteAllMeasurementsForVariable($rootScope.variableObject.id).then(function() {
                // If primaryOutcomeVariable, delete local storage measurements
                if ($rootScope.variableName === config.appSettings.primaryOutcomeVariableDetails.name) {
                    localStorageService.setItem('primaryOutcomeVariableMeasurements',[]);
                    localStorageService.setItem('primaryOutcomeVariableMeasurementsQueue',[]);
                    localStorageService.setItem('averagePrimaryOutcomeVariableValue',0);
                    localStorageService.setItem('lastPrimaryOutcomeVariableMeasurementsSyncTime',0);
                }
                $ionicLoading.hide();
                $state.go(config.appSettings.defaultState);
                console.debug("All measurements for " + $rootScope.variableName + " deleted!");
            }, function(error) {
                $ionicLoading.hide();
                console.debug('Error deleting measurements: '+ JSON.stringify(error));
            });
        };

        $scope.showDeleteAllMeasurementsForVariablePopup = function(){
            $ionicPopup.show({
                title:'Delete all ' + $rootScope.variableName + " measurements?",
                subTitle: 'This cannot be undone!',
                scope: $scope,
                buttons:[
                    {
                        text: 'Yes',
                        type: 'button-positive',
                        onTap: $scope.deleteAllMeasurementsForVariable
                    },
                    {
                        text: 'No',
                        type: 'button-assertive'
                    }
                ]

            });
        };

        // Triggered on a button click, or some other target
        $scope.showFavoriteActionSheet = function(favorite, $index, bloodPressure) {

            var variableObject = {
                id: favorite.variableId,
                name: favorite.variableName
            };


            var actionMenuButtons = [
                { text: '<i class="icon ion-gear-a"></i>Change Default Value' },
                { text: '<i class="icon ion-edit"></i>Other Value/Time/Note' },
                { text: '<i class="icon ion-arrow-graph-up-right"></i>Charts'},
                { text: '<i class="icon ion-ios-list-outline"></i>' + 'History'},
                { text: '<i class="icon ion-settings"></i>' + 'Variable Settings'},
                { text: '<i class="icon ion-android-notifications-none"></i>Add Reminder'}
            ];


            if(config.appSettings.favoritesController){
                if(config.appSettings.favoritesController.actionMenuButtons){
                    actionMenuButtons = config.appSettings.favoritesController.actionMenuButtons;
                }
            }


            if(bloodPressure){
                actionMenuButtons = [];
            }

            // Show the action sheet
            var hideSheet = $ionicActionSheet.show({
                buttons: actionMenuButtons,
                destructiveText: '<i class="icon ion-trash-a"></i>Delete From Favorites',
                cancelText: '<i class="icon ion-ios-close"></i>Cancel',
                cancel: function() {
                    console.debug('CANCELLED');
                },
                buttonClicked: function(index) {
                    console.debug('BUTTON CLICKED', index);
                    if(index === 0){
                        $state.go('app.favoriteAdd', {reminder: favorite});
                    }
                    if(index === 1){
                        $state.go('app.measurementAdd', {trackingReminder: favorite});
                    }
                    if(index === 2){
                        $state.go('app.charts',
                            {
                                trackingReminder: favorite,
                                fromState: $state.current.name,
                                fromUrl: window.location.href
                            });
                    }
                    if (index === 3) {
                        $scope.goToHistoryForVariableObject(variableObject);
                    }
                    if (index === 4) {
                        $state.go('app.variableSettings',
                            {variableName: favorite.variableName});
                    }
                    if(index === 5){
                        var reminder = JSON.parse(JSON.stringify(favorite));
                        reminder.id = null;
                        reminder.trackingReminderId = null;
                        $state.go('app.reminderAdd',
                            {
                                reminder: reminder,
                                fromState: $state.current.name,
                                fromUrl: window.location.href
                            });
                    }

                    return true;
                },
                destructiveButtonClicked: function() {
                    if(!bloodPressure){
                        $rootScope.favoritesArray.splice($index, 1);
                        reminderService.deleteReminder(favorite.id)
                            .then(function(){
                                console.debug('Favorite deleted: ' + JSON.stringify(favorite));
                            }, function(error){
                                console.error('Failed to Delete Favorite!  Error is ' + error.message + '.  Favorite is ' + JSON.stringify(favorite));
                            });
                        localStorageService.deleteElementOfItemById('trackingReminders', favorite.id)
                            .then(function(){
                                //$scope.init();
                            });
                        return true;
                    }

                    if(bloodPressure){
                        reminderService.deleteReminder($rootScope.bloodPressureReminderId)
                            .then(function(){
                                console.debug('Favorite deleted: ' + JSON.stringify($rootScope.bloodPressure));
                            }, function(error){
                                console.error('Failed to Delete Favorite!  Error is ' + error.message + '.  Favorite is ' + JSON.stringify($rootScope.bloodPressure));
                            });
                        localStorageService.deleteElementOfItemById('trackingReminders', $rootScope.bloodPressureReminderId)
                            .then(function(){
                                //$scope.init();
                            });
                        $rootScope.bloodPressureReminderId = null;
                        return true;
                    }
                }
            });

            console.debug('Setting hideSheet timeout');
            $timeout(function() {
                hideSheet();
            }, 20000);

        };

        $scope.trackBloodPressure = function(){
            if(!$rootScope.bloodPressure.diastolicValue || !$rootScope.bloodPressure.systolicValue){
                $scope.favoriteValidationFailure('Please enter both values for blood pressure.');
                return;
            }
            $rootScope.bloodPressure.displayTotal = "Recorded " + $rootScope.bloodPressure.systolicValue + "/" + $rootScope.bloodPressure.diastolicValue + ' Blood Pressure';
            measurementService.postBloodPressureMeasurements($rootScope.bloodPressure)
                .then(function () {
                    console.debug("Successfully measurementService.postMeasurementByReminder: " + JSON.stringify($rootScope.bloodPressure));
                }, function(error) {
                    if (typeof Bugsnag !== "undefined") { Bugsnag.notify(error, JSON.stringify(error), {}, "error"); } console.error(error);
                    console.error('Failed to Track by favorite, Try again!');
                });
        };

        $scope.refreshVariables = function () {
            variableService.refreshCommonVariables().then(function () {
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, function (error) {
                console.error(error);
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });
            variableService.refreshUserVariables().then(function () {
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            }, function (error) {
                console.error(error);
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        $scope.showExplanationsPopup = function(settingName) {
            var explanationText = {
                "Minimum value": "The minimum allowed value for measurements. " +
                "While you can record a value below this minimum, it will be " +
                "excluded from the correlation analysis.",
                "Maximum value": "The maximum allowed value for measurements. " +
                "While you can record a value above this maximum, it will be " +
                "excluded from the correlation analysis.",
                "Onset delay": "An outcome is always preceded by the predictor or stimulus. " +
                "The amount of time that elapses after the predictor/stimulus event " +
                "before the outcome as perceived by a self-tracker is known as the “onset delay”.  " +
                "For example, the “onset delay” between the time a person takes an aspirin " +
                "(predictor/stimulus event) and the time a person perceives a change in their" +
                " headache severity (outcome) is approximately 30 minutes.",
                "Duration of action": "The amount of time over " +
                "which a predictor/stimulus event can exert an observable influence " +
                "on an outcome variable’s value. For instance, aspirin (stimulus/predictor) " +
                "typically decreases headache severity for approximately four hours" +
                " (duration of action) following the onset delay.",
                "Filling value": "When it comes to analysis to determine the effects of this variable," +
                " knowing when it did not occur is as important as knowing when it did occur. " +
                "For example, if you are tracking a medication, it is important to know " +
                "when you did not take it, but you do not have to log zero values for " +
                "all the days when you haven't taken it. Hence, you can specify a filling value " +
                "(typically 0) to insert whenever data is missing.",
                "Combination Method": "How multiple measurements are combined over time.  We use the average (or mean) " +
                "for things like your weight.  Summing is used for things like number of apples eaten. "
            };

            $ionicPopup.show({
                title: settingName,
                subTitle: explanationText[settingName],
                scope: $scope,
                buttons: [
                    {
                        text: 'OK',
                        type: 'button-positive'
                    }
                ]
            });

        };

        $scope.saveVariableSettings = function(variableObject){
            var params = {
                variableId: variableObject.id,
                durationOfAction: variableObject.durationOfActionInHours*60*60,
                fillingValue: variableObject.fillingValue,
                //joinWith
                maximumAllowedValue: variableObject.maximumAllowedValue,
                minimumAllowedValue: variableObject.minimumAllowedValue,
                onsetDelay: variableObject.onsetDelayInHours*60*60,
                combinationOperation: variableObject.combinationOperation
                //userVariableAlias: $scope.state.userVariableAlias
                //experimentStartTime
                //experimentEndTime
            };

            console.debug('Saving variable settings ' + JSON.stringify(params));
            $ionicLoading.show({ template: '<ion-spinner></ion-spinner>' });
            variableService.postUserVariable(params).then(function() {
                localStorageService.deleteItem('lastStudy');
                console.debug("variableService.postUserVariable: success: " + JSON.stringify(params));
                $ionicLoading.hide();
                $ionicHistory.goBack();
            }, function(error) {
                $ionicLoading.hide();
                console.error(error);
            });
        };

        $scope.setupVariableByVariableObject = function(variableObject) {
            $rootScope.variableName = variableObject.name;
            $rootScope.variableObject = variableObject;
            $rootScope.variableObject.onsetDelayInHours = variableObject.onsetDelay/3600;
            $rootScope.variableObject.durationOfActionInHours = variableObject.durationOfAction/3600;
            $scope.loading = false;
            $scope.hideLoader() ;
        };

        $scope.getVariableByName = function (variableName) {
            $ionicLoading.show({template: '<ion-spinner></ion-spinner>'});
            var params = {includeTags : true};
            variableService.getVariablesByName(variableName, params).then(function(variableObject){
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
                $ionicLoading.hide();
                $rootScope.variableObject = variableObject;
                $scope.setupVariableByVariableObject(variableObject);
            }, function (error) {
                //Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
                $ionicLoading.hide();
                console.error(error);
            });
        };

        $scope.resetVariableToDefaultSettings = function(variableObject) {
            // Populate fields with original settings for variable
            $ionicLoading.show({template: '<ion-spinner></ion-spinner>'});
            variableService.resetUserVariable(variableObject.id).then(function() {
                $scope.getVariableByName(variableObject.name);
            });
        };

        $scope.init();
    });
