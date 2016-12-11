angular.module('starter')
	// Measurement Service
	.factory('measurementService', function($q, $rootScope, QuantiModo, localStorageService,
                                            ratingService, utilsService) {

        //flag to indicate if data syncing is in progress
        var isSyncing = false;

		// service methods
		var measurementService = {

            getAllLocalMeasurements : function(){
                var primaryOutcomeMeasurements = localStorageService.getItemAsObject('primaryOutcomeVariableMeasurements');
                if(!primaryOutcomeMeasurements) {
                    primaryOutcomeMeasurements = [];
                }
                var primaryOutcomeVariableMeasurementsQueue = localStorageService.getItemAsObject('primaryOutcomeVariableMeasurementsQueue');
                if(primaryOutcomeVariableMeasurementsQueue){
                    primaryOutcomeMeasurements = primaryOutcomeMeasurements.concat(primaryOutcomeVariableMeasurementsQueue);
                }
                primaryOutcomeMeasurements = primaryOutcomeMeasurements.sort(function(a,b){
                    if(a.startTimeEpoch < b.startTimeEpoch){
                        return 1;}
                    if(a.startTimeEpoch> b.startTimeEpoch)
                    {return -1;}
                    return 0;
                });
                return ratingService.addInfoAndImagesToMeasurements(primaryOutcomeMeasurements);
            },

            // get data from QuantiModo API
            getMeasurements : function(){
                var deferred = $q.defer();
                isSyncing = true;

                $rootScope.lastPrimaryOutcomeVariableMeasurementsSyncTime = localStorageService.getItemSync('lastPrimaryOutcomeVariableMeasurementsSyncTime');
                if (!$rootScope.lastPrimaryOutcomeVariableMeasurementsSyncTime) {
                	$rootScope.lastPrimaryOutcomeVariableMeasurementsSyncTime = 0;
                }
                var nowDate = new Date();
                var lastSyncDate = new Date($rootScope.lastPrimaryOutcomeVariableMeasurementsSyncTime);
                var milliSecondsSinceLastSync = nowDate - lastSyncDate;
                /*
                if(milliSecondsSinceLastSync < 5 * 60 * 1000){
                	$rootScope.$broadcast('updateCharts');
                	deferred.resolve();
               		return deferred.promise;
                }
                */

                // send request
                var params;
                var lastPrimaryOutcomeVariableMeasurementsSyncTimeMinusFifteenMinutes = moment($rootScope.lastPrimaryOutcomeVariableMeasurementsSyncTime).subtract(15, 'minutes').format("YYYY-MM-DDTHH:mm:ss");
                params = {
                    variableName : config.appSettings.primaryOutcomeVariableDetails.name,
                    'updatedAt':'(ge)'+ lastPrimaryOutcomeVariableMeasurementsSyncTimeMinusFifteenMinutes ,
                    sort : '-startTimeEpoch',
                    limit:200,
                    offset:0
                };

                localStorageService.getItem('user', function(user){
                    if(!user){
                        deferred.resolve();
                    }
                });

                var getPrimaryOutcomeVariableMeasurements = function(params) {
                    QuantiModo.getV1Measurements(params, function(response){
                        // Do the stuff with adding to primaryOutcomeVariableMeasurements
                        if (response.length > 0 && response.length <= 200) {
                            // Update local data
                            var primaryOutcomeVariableMeasurements;
                            localStorageService.getItem('primaryOutcomeVariableMeasurements',function(primaryOutcomeVariableMeasurements){
                                primaryOutcomeVariableMeasurements = primaryOutcomeVariableMeasurements ? JSON.parse(primaryOutcomeVariableMeasurements) : [];

                                var filteredStoredMeasurements = [];
                                primaryOutcomeVariableMeasurements.forEach(function(storedMeasurement) {
                                    var found = false;
                                    var i = 0;
                                    while (!found && i < response.length) {
                                        var responseMeasurement = response[i];
                                        if (storedMeasurement.startTimeEpoch === responseMeasurement.startTimeEpoch &&
                                            storedMeasurement.id === responseMeasurement.id) {
                                            found = true;
                                        }
                                        i++;
                                    }
                                    if (!found) {
                                        filteredStoredMeasurements.push(storedMeasurement);
                                    }
                                });
                                primaryOutcomeVariableMeasurements = filteredStoredMeasurements.concat(response);

                                var s  = 9999999999999;
                                primaryOutcomeVariableMeasurements.forEach(function(x){
                                    if(!x.startTimeEpoch){
                                        x.startTimeEpoch = x.timestamp;
                                    }
                                    if(x.startTimeEpoch <= s){
                                        s = x.startTimeEpoch;
                                    }
                                });

                                // FIXME Is this right? Doesn't do what is described
                                // updating last updated time and data in local storage so that we syncing should continue from this point
                                // if user restarts the app or refreshes the page.
                                console.debug("getPrimaryOutcomeVariableMeasurements is calling measurementService.setDates");
                                //measurementService.setDates(new Date().getTime(),s*1000);
                                //console.debug("getPrimaryOutcomeVariableMeasurements: primaryOutcomeVariableMeasurements length is " + primaryOutcomeVariableMeasurements.length);
                                //console.debug("getPrimaryOutcomeVariableMeasurements:  Setting primaryOutcomeVariableMeasurements to: ", primaryOutcomeVariableMeasurements);
                                localStorageService.setItem('primaryOutcomeVariableMeasurements', JSON.stringify(primaryOutcomeVariableMeasurements));
                                console.debug("getPrimaryOutcomeVariableMeasurements broadcasting to update charts");
                                $rootScope.$broadcast('updateCharts');
                            });
                        }

                        if (response.length < 200 || params.offset > 1000) {
                            $rootScope.lastPrimaryOutcomeVariableMeasurementsSyncTime = moment.utc().format('YYYY-MM-DDTHH:mm:ss');
                            localStorageService.setItem('lastPrimaryOutcomeVariableMeasurementsSyncTime', $rootScope.lastPrimaryOutcomeVariableMeasurementsSyncTime);
                            console.debug("Measurement sync completed and lastPrimaryOutcomeVariableMeasurementsSyncTime set to " + $rootScope.lastPrimaryOutcomeVariableMeasurementsSyncTime);
                            deferred.resolve(response);
                        } else if (response.length === 200 && params.offset < 1001) {
                            // Keep querying
                            params = {
                                variableName: config.appSettings.primaryOutcomeVariableDetails.name,
                                'updatedAt':'(ge)'+ lastPrimaryOutcomeVariableMeasurementsSyncTimeMinusFifteenMinutes ,
                                sort : '-startTimeEpoch',
                                limit: 200,
                                offset: params.offset + 200
                            };
                            console.debug('Keep querying because response.length === 200 && params.offset < 2001');
                            getPrimaryOutcomeVariableMeasurements(params);
                        }
                        else {
                            // More than 200 measurements returned, something is wrong
                            deferred.reject(response);
                        }

                    }, function(error){
                        deferred.reject(error);
                    });
                };

                getPrimaryOutcomeVariableMeasurements(params);
                
                return deferred.promise;
            },

            syncPrimaryOutcomeVariableMeasurements : function(){
                var defer = $q.defer();

                if(!$rootScope.user && !$rootScope.accessToken){
                    console.debug('Not doing syncPrimaryOutcomeVariableMeasurements because we do not have a $rootScope.user');
                    defer.resolve();
                    return defer.promise;
                }

                localStorageService.getItem('primaryOutcomeVariableMeasurementsQueue',function(primaryOutcomeVariableMeasurementsQueue) {

                    var measurementObjects = JSON.parse(primaryOutcomeVariableMeasurementsQueue);

                    if(!measurementObjects || measurementObjects.length < 1){
                        console.debug('No measurements to sync!');
                        measurementService.getMeasurements().then(function(){
                            defer.resolve();
                        });
                    } else {
                        var measurements = [
                            {
                                variableName: config.appSettings.primaryOutcomeVariableDetails.name,
                                source: config.appSettings.appName + " " + $rootScope.currentPlatform,
                                variableCategoryName: config.appSettings.primaryOutcomeVariableDetails.category,
                                combinationOperation: config.appSettings.primaryOutcomeVariableDetails.combinationOperation,
                                abbreviatedUnitName: config.appSettings.primaryOutcomeVariableDetails.abbreviatedUnitName,
                                measurements: measurementObjects
                            }
                        ];

                        console.debug('Syncing measurements to server: ' + JSON.stringify(measurementObjects));

                        QuantiModo.postMeasurementsV2(measurements, function (response) {
                            localStorageService.setItem('primaryOutcomeVariableMeasurementsQueue', JSON.stringify([]));
                            measurementService.getMeasurements().then(function() {
                                defer.resolve();
                                console.debug("QuantiModo.postMeasurementsV2 success: " + JSON.stringify(response));
                            });
                        }, function (response) {
                            console.debug("error: " + JSON.stringify(response));
                            defer.resolve();
                        });
                    }
                });

                return defer.promise;
            },

			// date setter from - to
			setDates : function(to, from){
                var oldFromDate = localStorageService.getItemSync('fromDate');
                var oldToDate = localStorageService.getItemSync('toDate');
                localStorageService.setItem('fromDate',parseInt(from));
				localStorageService.setItem('toDate',parseInt(to));
                // if date range changed, update charts
                if (parseInt(oldFromDate) !== parseInt(from) || parseInt(oldToDate) !== parseInt(to)) {
                    console.debug("setDates broadcasting to update charts");
                    $rootScope.$broadcast('updateCharts');
                    $rootScope.$broadcast('updatePrimaryOutcomeHistory');
                }

			},



			// retrieve date to end on
			getToDate : function(callback){
                localStorageService.getItem('toDate',function(toDate){
                    if(toDate){
                        callback(parseInt(toDate));
                    }else{
                        callback(parseInt(Date.now()));
                    }
                });

			},

			// retrieve date to start from
			getFromDate : function(callback){
                localStorageService.getItem('fromDate',function(fromDate){
                    if(fromDate){
                        callback(parseInt(fromDate));
                    }else{
                        var date = new Date();

                        // Threshold 20 Days if not provided
                        date.setDate(date.getDate()-20);

                        console.debug("The date returned is ", date.toString());
                        callback(parseInt(date.getTime()));
                    }
                });
			},
            
            createPrimaryOutcomeMeasurement : function(numericRatingValue) {
                // if val is string (needs conversion)
                if(isNaN(parseFloat(numericRatingValue))){
                    numericRatingValue = config.appSettings.ratingTextToValueConversionDataSet[numericRatingValue] ?
                        config.appSettings.ratingTextToValueConversionDataSet[numericRatingValue] : false;
                }
                var startTimeEpoch  = new Date().getTime();
                var measurementObject = {
                    id: null,
                    variable: config.appSettings.primaryOutcomeVariableDetails.name,
                    variableName: config.appSettings.primaryOutcomeVariableDetails.name,
                    variableCategoryName: config.appSettings.primaryOutcomeVariableDetails.category,
                    variableDescription: config.appSettings.primaryOutcomeVariableDetails.description,
                    startTimeEpoch: Math.floor(startTimeEpoch / 1000),
                    abbreviatedUnitName: config.appSettings.primaryOutcomeVariableDetails.abbreviatedUnitName,
                    value: numericRatingValue,
                    note: "",
                    latitude: $rootScope.lastLatitude,
                    longitude: $rootScope.lastLongitude,
                    location: $rootScope.lastLocationNameAndAddress
                };
                return measurementObject;
            },

            // used when adding a new measurement from record measurement OR updating a measurement through the queue
            addToMeasurementsQueue : function(measurementObject){
                console.debug("added to primaryOutcomeVariableMeasurementsQueue: id = " + measurementObject.id);
                var deferred = $q.defer();

                localStorageService.getItem('primaryOutcomeVariableMeasurementsQueue',function(primaryOutcomeVariableMeasurementsQueue) {
                    primaryOutcomeVariableMeasurementsQueue = primaryOutcomeVariableMeasurementsQueue ? JSON.parse(primaryOutcomeVariableMeasurementsQueue) : [];
                    // add to queue
                    primaryOutcomeVariableMeasurementsQueue.push({
                        id: measurementObject.id,
                        variable: config.appSettings.primaryOutcomeVariableDetails.name,
                        variableName: config.appSettings.primaryOutcomeVariableDetails.name,
                        variableCategoryName: measurementObject.variableCategoryName,
                        variableDescription: config.appSettings.primaryOutcomeVariableDetails.description,
                        startTimeEpoch: measurementObject.startTimeEpoch,
                        abbreviatedUnitName: config.appSettings.primaryOutcomeVariableDetails.abbreviatedUnitName,
                        value: measurementObject.value,
                        note: measurementObject.note,
                        latitude: $rootScope.lastLatitude,
                        longitude: $rootScope.lastLongitude,
                        location: $rootScope.lastLocationNameAndAddress
                    });
                    //resave queue
                    localStorageService.setItem('primaryOutcomeVariableMeasurementsQueue', JSON.stringify(primaryOutcomeVariableMeasurementsQueue));
                });
                return deferred.promise;
            },

            // post a single measurement
            postTrackingMeasurement : function(measurementInfo, usePromise){

                var deferred = $q.defer();

                // make sure startTimeEpoch isn't in milliseconds
                var nowMilliseconds = new Date();
                var oneWeekInFuture = nowMilliseconds.getTime()/1000 + 7 * 86400;
                if(measurementInfo.startTimeEpoch > oneWeekInFuture){
                    measurementInfo.startTimeEpoch = measurementInfo.startTimeEpoch / 1000;
                    console.warn('Assuming startTime is in milliseconds since it is more than 1 week in the future');
                }

                if (measurementInfo.variableName === config.appSettings.primaryOutcomeVariableDetails.name) {
                    // Primary outcome variable - update through primaryOutcomeVariableMeasurementsQueue
                    var found = false;
                    if (measurementInfo.prevStartTimeEpoch) {
                        localStorageService.getItemAsObject('primaryOutcomeVariableMeasurementsQueue',function(primaryOutcomeVariableMeasurementsQueue) {
                            var i = 0;
                            while (!found && i < primaryOutcomeVariableMeasurementsQueue.length) {
                                if (primaryOutcomeVariableMeasurementsQueue[i].startTimeEpoch === measurementInfo.prevStartTimeEpoch) {
                                    found = true;
                                    primaryOutcomeVariableMeasurementsQueue[i].startTimeEpoch = measurementInfo.startTimeEpoch;
                                    primaryOutcomeVariableMeasurementsQueue[i].value =  measurementInfo.value;
                                    primaryOutcomeVariableMeasurementsQueue[i].note = measurementInfo.note;
                                }
                            }
                            localStorageService.setItem('primaryOutcomeVariableMeasurementsQueue',JSON.stringify(primaryOutcomeVariableMeasurementsQueue));
                        });

                    } else if(measurementInfo.id) {
                        var newAllMeasurements = [];
                        localStorageService.getItem('primaryOutcomeVariableMeasurements',function(oldAllMeasurements) {
                        	oldAllMeasurements = oldAllMeasurements ? JSON.parse(oldAllMeasurements) : [];
                            oldAllMeasurements.forEach(function (storedMeasurement) {
                                // look for edited measurement based on IDs
                                if (found || storedMeasurement.id !== measurementInfo.id) {
                                    // copy non-edited measurements to newAllMeasurements
                                    newAllMeasurements.push(storedMeasurement);
                                }
                                else {
                                    console.debug("edited measurement found in primaryOutcomeVariableMeasurements");
                                    // don't copy
                                    found = true;
                                }
                            });
                        });
                        console.debug("postTrackingMeasurement: newAllMeasurements length is " + newAllMeasurements.length);
                        //console.debug("postTrackingMeasurement:  Setting primaryOutcomeVariableMeasurements to: ", newAllMeasurements);
                        localStorageService.setItem('primaryOutcomeVariableMeasurements', JSON.stringify(newAllMeasurements));
                        var editedMeasurement = {
                            id: measurementInfo.id,
                            variableName: measurementInfo.variableName,
                            source: config.appSettings.appName + $rootScope.currentPlatform,
                            abbreviatedUnitName: measurementInfo.unit,
                            startTimeEpoch:  measurementInfo.startTimeEpoch,
                            value: measurementInfo.value,
                            variableCategoryName : measurementInfo.variableCategoryName,
                            note : measurementInfo.note,
                            combinationOperation : measurementInfo.combinationOperation,
                            latitude: $rootScope.lastLatitude,
                            longitude: $rootScope.lastLongitude,
                            location: $rootScope.lastLocationNameAndAddress
                        };
                        measurementService.addToMeasurementsQueue(editedMeasurement);

                    } else {
                        // adding primary outcome variable measurement from record measurements page
                        var newMeasurement = {
                            id: null,
                            variableName: measurementInfo.variableName,
                            source: config.appSettings.appName + $rootScope.currentPlatform,
                            abbreviatedUnitName: measurementInfo.unit,
                            startTimeEpoch:  measurementInfo.startTimeEpoch,
                            value: measurementInfo.value,
                            variableCategoryName : measurementInfo.variableCategoryName,
                            note : measurementInfo.note,
                            combinationOperation : measurementInfo.combinationOperation,
                            latitude: $rootScope.lastLatitude,
                            longitude: $rootScope.lastLongitude,
                            location: $rootScope.lastLocationNameAndAddress
                        };
                        measurementService.addToMeasurementsQueue(newMeasurement);
                    }

                    measurementService.syncPrimaryOutcomeVariableMeasurements()
                        .then(function() {
                            if(usePromise) {
                                deferred.resolve();
                            }
                        });
                }
                else {
                    // Non primary outcome variable, post immediately
                    var measurementSourceName = config.appSettings.appName;
                    if(measurementInfo.sourceName){
                        measurementSourceName = measurementInfo.sourceName;
                    }
                    // measurements set
                    var measurements = [
                        {
                            variableName: measurementInfo.variableName,
                            source: measurementSourceName,
                            variableCategoryName: measurementInfo.variableCategoryName,
                            abbreviatedUnitName: measurementInfo.abbreviatedUnitName,
                            combinationOperation : measurementInfo.combinationOperation,
                            measurements : [
                                {
                                    id: measurementInfo.id,
                                    startTimeEpoch:  measurementInfo.startTimeEpoch,
                                    value: measurementInfo.value,
                                    note : measurementInfo.note,
                                    latitude: $rootScope.lastLatitude,
                                    longitude: $rootScope.lastLongitude,
                                    location: $rootScope.lastLocationNameAndAddress
                                }
                            ]
                        }
                    ];

                    // for local
                    var measurement = {
                        variableName: measurementInfo.variableName,
                        source: config.appSettings.appName + $rootScope.currentPlatform,
                        abbreviatedUnitName: measurementInfo.unit,
                        startTimeEpoch:  measurementInfo.startTimeEpoch,
                        value: measurementInfo.value,
                        variableCategoryName : measurementInfo.variableCategoryName,
                        note : measurementInfo.note,
                        combinationOperation : measurementInfo.combinationOperation,
                        latitude: $rootScope.lastLatitude,
                        longitude: $rootScope.lastLongitude,
                        location: $rootScope.lastLocationNameAndAddress
                    };

                    // send request
                    QuantiModo.postMeasurementsV2(measurements, function(response){
                        if(response.success) {
                            console.debug("postMeasurementsV2 success " + JSON.stringify(response));
                            if(usePromise) {
                                deferred.resolve();
                            }
                        } else {
                            console.debug("QuantiModo.postMeasurementsV2 error" + JSON.stringify(response));
                            if(usePromise) {
                                deferred.reject(response.message ? response.message.split('.')[0] : "Can't post measurement right now!");
                            }
                        }
                    }, function(response){
                        console.debug("QuantiModo.postMeasurementsV2 error" + JSON.stringify(response));
                        if(usePromise) {
                            deferred.reject(response.message ? response.message.split('.')[0] : "Can't post measurement right now!");
                        }
                    });
                }
                if(usePromise) {
                    return deferred.promise;
                }
            },

            postMeasurementByReminder: function(trackingReminder, modifiedValue) {

                // send request
                var value = trackingReminder.defaultValue;
                if(typeof modifiedValue !== "undefined" && modifiedValue !== null){
                    value = modifiedValue;
                }

                var startTimeEpochMilliseconds = new Date();
                var startTimeEpochSeconds = startTimeEpochMilliseconds/1000;
                // measurements set
                var measurementSet = [
                    {
                        variableName: trackingReminder.variableName,
                        source: config.appSettings.appName + $rootScope.currentPlatform,
                        variableCategoryName: trackingReminder.variableCategoryName,
                        abbreviatedUnitName: trackingReminder.abbreviatedUnitName,
                        measurements : [
                            {
                                startTimeEpoch:  startTimeEpochSeconds,
                                value: value,
                                note : null,
                                latitude: $rootScope.lastLatitude,
                                longitude: $rootScope.lastLongitude,
                                location: $rootScope.lastLocationNameAndAddress
                            }
                        ]
                    }
                ];

                var deferred = $q.defer();

                QuantiModo.postMeasurementsV2(measurementSet, function(response){
                    if(response.success) {
                        console.debug("QuantiModo.postMeasurementsV2 success: " + JSON.stringify(response));
                        deferred.resolve();
                    } else {
                        deferred.reject(response.message ? response.message.split('.')[0] : "Can't post measurement right now!");
                    }
                });

                return deferred.promise;
            },

            getHistoryMeasurements : function(params){
                var deferred = $q.defer();

                QuantiModo.getV1Measurements(params, function(response){
                    deferred.resolve(response);
                }, function(error){
                    if (typeof Bugsnag !== "undefined") {
                        Bugsnag.notify(error, JSON.stringify(error), {}, "error");
                    }
                    deferred.reject(error);
                });

                return deferred.promise;
            },

            getMeasurementById : function(measurementId){
                var deferred = $q.defer();
                var params = {id : measurementId};
                QuantiModo.getV1Measurements(params, function(response){
                    var measurementArray = response;
                    if(!measurementArray[0]){
                        console.debug('Could not get measurement with id: ' + measurementId);
                        deferred.reject();
                    }
                    var measurementObject = measurementArray[0];
                    deferred.resolve(measurementObject);
                }, function(error){
                    if (typeof Bugsnag !== "undefined") {
                        Bugsnag.notify(error, JSON.stringify(error), {}, "error");
                    }
                    console.debug(error);
                    deferred.reject();
                });
                return deferred.promise;
               
            },

            deleteMeasurementFromLocalStorage : function(measurement) {
                var deferred = $q.defer();
                localStorageService.deleteElementOfItemById('primaryOutcomeVariableMeasurements', measurement.id).then(function(){
                    deferred.resolve();
                });
                localStorageService.deleteElementOfItemByProperty('measurementQueue', 'startTimeEpoch',
                    measurement.startTimeEpoch).then(function (){
                    deferred.resolve();
                });
                return deferred.promise;
            },

            deleteMeasurementFromServer : function(measurement){
                var deferred = $q.defer();
                QuantiModo.deleteV1Measurements(measurement, function(response){
                    deferred.resolve(response);
                    console.debug("deleteMeasurementFromServer success " + JSON.stringify(response));
                }, function(response){
                    console.debug("deleteMeasurementFromServer error " + JSON.stringify(response));
                    deferred.reject();
                });
                return deferred.promise;
            },
		};

		measurementService.postBloodPressureMeasurements = function(parameters){
            var deferred = $q.defer();
		    var startTimeEpochSeconds;
            if(!parameters.startTimeEpochSeconds){
                var startTimeEpochMilliseconds = new Date();
                startTimeEpochSeconds = startTimeEpochMilliseconds/1000;
            } else {
                startTimeEpochSeconds = parameters.startTimeEpochSeconds;
            }

            var measurementSets = [
                {
                    variableId: 1874,
                    source: config.appSettings.appName + $rootScope.currentPlatform,
                    startTimeEpoch:  startTimeEpochSeconds,
                    value: parameters.systolicValue,
                    note: parameters.note,
                    latitude: $rootScope.lastLatitude,
                    longitude: $rootScope.lastLongitude,
                    location: $rootScope.lastLocationNameAndAddress
                },
                {
                    variableId: 5554981,
                    source: config.appSettings.appName + $rootScope.currentPlatform,
                    startTimeEpoch:  startTimeEpochSeconds,
                    value: parameters.diastolicValue,
                    note: parameters.note,
                    latitude: $rootScope.lastLatitude,
                    longitude: $rootScope.lastLongitude,
                    location: $rootScope.lastLocationNameAndAddress
                }
            ];

            QuantiModo.postMeasurementsV2(measurementSets, function(response){
                if(response.success) {
                    console.debug("QuantiModo.postMeasurementsV2 success: " + JSON.stringify(response));
                    deferred.resolve(response);
                } else {
                    deferred.reject(response);
                }
            });
            return deferred.promise;
        };

		return measurementService;
	});