(function() {
    var app = angular.module('MeetAbroad');
	
	app.controller('MainController', ['$scope', 'auth', '$http', '$state', function($scope, auth, $http, $state) {
		
		$scope.refreshMain = function(){
			
			// Our logged in styleSheets
			$scope.stylesheets = ['css/home.css'];
			
			$scope.resultsByDestinationCity = [];
			
			// Make user available to the whole app
			auth.getUser().then(function successCallback(response){
				user = response.data;
				
				// Do we have a destination city, etc? If not, it means we haven't completed our registration (facebook login for example)
				// We check if it's not undefined -> if it's not, then we have a completed registration in hands
				if(user.destinationcity !== '__undefined__')
				{
					// Make suggestions available to the whole app
					$http.get('/users/destinationcity/'+user.destinationcountry+'/'+user.destinationcity, {
						headers: {Authorization: 'Bearer '+auth.getToken()}
					}).then(function(response){
						
						suggestions = response.data;
						
						// We have our results now
						$scope.resultsByDestinationCity = suggestions;
					});
				}
			});
			
			$scope.unreadNotifications = 0;
			
			$http.get('/notifications/total', {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			}).then(function(response){
				data = response.data;
				
				$scope.unreadNotifications = data;
			});
			
			// Send request
			$scope.sendRequest = function(id){
				
				$http.post('/connections/new/'+id, user, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				}).then(function successCallback(response) {
					data = response.data;
					
					jQuery('#success_'+id+' span').text(data);
					jQuery('#success_'+id).slideToggle();
					jQuery('#send_'+id).remove();
					
					setTimeout(function() {
						jQuery('#row_'+id).slideToggle("fast", function() {
							// Remove from scope
							for (var i=0; i<$scope.resultsByDestinationCity.length; i++) {

								if($scope.resultsByDestinationCity[i]._id == id)
								{
									$scope.resultsByDestinationCity.splice(i, 1);
									break;
								}
							}
						});
						
						
					}, 1000); // <-- time in milliseconds
				}, function errorCallback(response) {
					data = response.data;
					
					jQuery('#error_'+id+' span').text(data);
					jQuery('#error_'+id).slideToggle();
					
					setTimeout(function() {
						jQuery('#error_'+id).slideToggle();
					}, 3000); // <-- time in milliseconds
				});
			};
		}
		
		if(auth.isLoggedIn())
		{
			$scope.refreshMain();
		}
	}]);
	
	app.controller('HomeController', ['$scope', '$http', 'auth', 'user', '$state', function($scope, $http, auth, user, $state) {
		
		// User did not complete registration
		if(user.destinationcity === '__undefined__')
		{
			$state.go('finishreg');
		}
	
		$scope.searchForm = true;
		$scope.searchResults = false;
		$scope.searchLoading = false;
		
		$scope.selected = {};
		$scope.search = {};
		$scope.adsearch = {display: false};
			
		$http.get('/interests', {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).then(function(response){
			data = response.data;
			
			$scope.interests = data;
		});
		
		$scope.user = user;
		
		$scope.doSearch = function(){
			
			$scope.error = null;
			$scope.results = [];
			$scope.searchForm = false;
			$scope.searchLoading = true;
			
			if($scope.adsearch.display == true)
			{
				$scope.search = angular.extend({}, $scope.search, $scope.adsearch);
				
				// Advanced search
				$http.post('/search/advanced', $scope.search, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				}).then(function successCallback(response){
					data = response.data;
					
					if(data.length == 0)
					{
						$scope.searchResults = false;
						$scope.searchLoading = false;
						$scope.searchForm = true;
						
						$scope.error = { message: "No results found." };
						
						jQuery(document).ready(function(){
							// Scroll to top by default
							jQuery('html, body').animate({
							  scrollTop: 0
							});
						});
					}
					else
					{
						$scope.results = data;
						
						$scope.searchLoading = false;
						$scope.searchResults = true;
						
						jQuery(document).ready(function(){
							// Scroll to top by default
							jQuery('html, body').animate({
							  scrollTop: 0
							});
						});
					}
					
				}, function errorCallback(response){
					data = response.data;
					$scope.error = { message: data };

					jQuery(document).ready(function(){
						// Scroll to top by default
						jQuery('html, body').animate({
						  scrollTop: 0
						});
					});
					
					$scope.searchResults = false;
					$scope.searchLoading = false;
					$scope.searchForm = true;
				});
			}
			else
			{
				// Basic
				$http.post('/search/basic', $scope.search, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				}).then(function successCallback(response){
					data = response.data;
					
					if(data.length == 0)
					{
						$scope.searchResults = false;
						$scope.searchLoading = false;
						$scope.searchForm = true;
						
						$scope.error = { message: "No results found." };
						
						jQuery(document).ready(function(){
							// Scroll to top by default
							jQuery('html, body').animate({
							  scrollTop: 0
							});
						});
					}
					else
					{
						$scope.results = data;
						
						$scope.searchLoading = false;
						$scope.searchResults = true;
						
						jQuery(document).ready(function(){
							// Scroll to top by default
							jQuery('html, body').animate({
							  scrollTop: 0
							});
						});
					}
					
				}, function errorCallback(response){
					data = response.data;
					$scope.error = { message: data };

					jQuery(document).ready(function(){
						// Scroll to top by default
						jQuery('html, body').animate({
						  scrollTop: 0
						});
					});
					
					$scope.searchResults = false;
					$scope.searchLoading = false;
					$scope.searchForm = true;
				});
			}
		};
		
		$scope.resetSearch = function(){
			$scope.error = null;
			$scope.searchResults = false;
			$scope.searchLoading = false;
			$scope.searchForm = true;
			$scope.results = [];
			
			jQuery(document).ready(function(){
				// Scroll to top by default
				jQuery('html, body').animate({
				  scrollTop: 0
				});
			});
		};
    }]);

    app.controller('UserController', ['$scope', '$http', 'auth', 'user', '$state', function($scope, $http, auth, user, $state) {
		
		// User did not complete registration
		if(user.destinationcity === '__undefined__')
		{
			$state.go('finishreg');
		}
		
		$scope.user = user;
		
		$scope.refreshInterests = function(){
			
			$scope.selected = {};
			
			$http.get('/interests', {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			}).then(function(response){
				data = response.data;
				
				$scope.interests = data;
			});
			
			$http.get('/interests/'+auth.currentUser(), {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			}).then(function(response){
				data = response.data;
				
				$scope.myinterests = data;
				
				// Update our 'selected' array
				var i;
				for(i=0; i<$scope.myinterests.length; i++)
				{
					$scope.selected[$scope.myinterests[i].codename] = true;
				}
			});
		};
	
        $scope.refreshInterests();
		
		// Check if it's in our interest list
		$scope.myInterest = function(interest){
			// If in array, then return true
			var i;
			for(i=0; i<this.myinterests.length; i++)
			{
				if (this.myinterests[i].codename == interest.codename)
				{
					return true;
				}
			}
			
			return false;
		};
		
		$scope.interestId = function(codename){
			
			// If in array, then return true
			var i;
			for(i=0; i<this.interests.length; i++)
			{
				if (this.interests[i].codename == codename)
				{
					return this.interests[i]._id;
				}
			}
			
			return false;
		};
		
		// Update our interests
		$scope.updateInterests = function(){
	
			var myinterests = [];
			
			angular.forEach($scope.selected, function(value, key) {

				if(value == true)
					myinterests.push($scope.interestId(key)); // store the _id
			});
			
			$http.post('/interests/update', {interests: myinterests}, {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			}).then(function(response){
				data = response.data;
				
				// Success
				$scope.success = {};
				$scope.success.message = data.message;
				
				// Refresh interests
				$scope.refreshInterests();
				
				jQuery(document).ready(function(){
					// Scroll to top by default
					jQuery('html, body').animate({
					  scrollTop: 0
					});
				});
			}, function(response){
				data = response.data;
				$scope.error = { message: data };
				
				jQuery(document).ready(function(){
					// Scroll to top by default
					jQuery('html, body').animate({
					  scrollTop: 0
					});
				});
			});
		};
		
		// Update our options
		$scope.updateOptions = function(){
			
			$http.post('/users/update', $scope.user, {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			}).then(function successCallback(response){
				data = response.data;
				
				// Success
				$scope.success = {};
				$scope.success.message = data.message;
				
				jQuery(document).ready(function(){
					// Scroll to top by default
					jQuery('html, body').animate({
					  scrollTop: 0
					});
				});
				
				// Refresh options
				/*$http.get('/users/'+auth.currentUser(), {
						headers: {Authorization: 'Bearer '+auth.getToken()}
				}).success(function(data){
					$scope.user = data;
				});*/
			}, function errorCallback(response){
				data = response.data;
				$scope.error = { message: data };

				jQuery(document).ready(function(){
					// Scroll to top by default
					jQuery('html, body').animate({
					  scrollTop: 0
					});
				});
			});
		};
    }]);
	
	app.controller('NotificationsController', ['$scope', '$http', 'auth', 'user', '$state', function($scope, $http, auth, user, $state) {
		$scope.user = user;
		
		$http.get('/notifications', {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).then(function(response){
			data = response.data;
			
			$scope.notifications = data;
		});
		
		
		// Accept request
		$scope.acceptRequest = function(id){
			$http.post('/connections/accept/'+id, $scope.user, {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			}).then(function successCallback(response) {
				data = response.data;
				$scope.unreadNotifications--;
				$scope.notifications.total--;
				jQuery('#reject_'+id).slideToggle();
				jQuery('#accept_'+id).slideToggle();
				
				jQuery('#success_'+id+' span').text(data);
				jQuery('#success_'+id).slideToggle();
				
				setTimeout(function() {
					jQuery('#row_'+id).slideToggle();
				}, 3000); // <-- time in milliseconds
			}, function errorCallback(response) {
				data = response.data;
				
				jQuery('#reject_'+id).slideToggle();
				jQuery('#accept_'+id).slideToggle();
				
				jQuery('#error_'+id+' span').text(data);
				jQuery('#error_'+id).slideToggle();
				
				setTimeout(function() {
					jQuery('#error_'+id).slideToggle();
				}, 3000); // <-- time in milliseconds
			});
		};
		
		// Reject request
		$scope.rejectRequest = function(id){
			
			$http.post('/connections/reject/'+id, $scope.user, {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			}).then(function successCallback(response) {
				data = response.data;
				
				$scope.unreadNotifications--;
				$scope.notifications.total--;
				
				jQuery('#reject_'+id).slideToggle();
				jQuery('#accept_'+id).slideToggle();
				
				jQuery('#success_'+id+' span').text(data);
				jQuery('#success_'+id).slideToggle();
				
				setTimeout(function() {
					jQuery('#row_'+id).slideToggle();
				}, 3000); // <-- time in milliseconds
			}, function errorCallback(response) {
				data = response.data;
				
				jQuery('#reject_'+id).slideToggle();
				jQuery('#accept_'+id).slideToggle();
				
				jQuery('#error_'+id+' span').text(data);
				jQuery('#error_'+id).slideToggle();
				
				setTimeout(function() {
					jQuery('#error_'+id).slideToggle();
				}, 3000); // <-- time in milliseconds
			});
		};
	}]);
	
	app.controller('ConnectionsController', ['$scope', '$http', 'auth', 'user', '$state', function($scope, $http, auth, user, $state) {
		$scope.user = user;
		$scope.connections = "loading";
		
		$http.get('/connections/established/'+user._id, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).then(function(response){
			data = response.data;
			
			$scope.connections = [];
			
			// Go through each connection and push it to the connections array, properly.
			angular.forEach(data, function(value, key) {

				value.uid1.connectionid = value._id; // otherwise it gets lost when we push uid1 or uid2
				value.uid2.connectionid = value._id; // otherwise it gets lost when we push uid1 or uid2
			
				if(value.uid1._id != user._id)
				{
					// If uid1 is not us, then we want this one
					$scope.connections.push(value.uid1);
				}
				else
				{
					// Otherwise we want uid2
					$scope.connections.push(value.uid2);
				}
			});
		}, function(response){
			// Error -> let's assume it's empty
			$scope.connections = [];
		});
		
		// Delete connection
		$scope.deleteConnection = function(id){
			
			$http.post('/connections/delete/'+id, user, {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			}).then(function successCallback(response) {
				data = response.data;
				
				jQuery('#success_'+id+' span').text(data);
				jQuery('#success_'+id).slideToggle();
				jQuery('#delete_'+id).remove();
				
				setTimeout(function() {
					jQuery('#row_'+id).slideToggle("fast", function() {
						// Remove from scope
						for (var i=0; i<$scope.connections.length; i++) {

							if($scope.connections[i].connectionid == id)
							{
								$scope.connections.splice(i, 1);
								break;
							}
						}
					});
					
					console.log($scope.connections);
				}, 1000); // <-- time in milliseconds
			}, function errorCallback(response) {
				data = response.data;
				
				jQuery('#error_'+id+' span').text(data);
				jQuery('#error_'+id).slideToggle();
				
				setTimeout(function() {
					jQuery('#error_'+id).slideToggle();
				}, 3000); // <-- time in milliseconds
			});
		};
	}]);
	
	app.controller('FacebookController', ['$state', '$scope', 'auth', 'user', '$state', '$stateParams', '$window',
		function($state, $scope, auth, user, $state, $stateParams, $window) {
		
		if(!auth.isLoggedIn())
		{
			// Then we're probably trying to log in!
			var token = $stateParams.token;
			
			if(token !== 'undefined' && token.length > 0)
				auth.saveToken(token);
				
			// We definitely have to reload here...because we need to veriy afterwards when we're logged in, if the user has completed reg or not
			$window.location.reload();
		}
		else
		{
			$scope.user = user;
			
			if(user.destinationcity === '__undefined__')
			{
				// Go to finish registration
				$state.go('finishreg');
			}
			else
			{
				// Go to home
				$scope.refreshMain(); // hard refresh to re-load MainController
				$state.go('home');
			}
		}
	}]);

	app.controller('GoogleController', ['$state', '$scope', 'auth', 'user', '$state', '$stateParams', '$window',
		function($state, $scope, auth, user, $state, $stateParams, $window) {

			if(!auth.isLoggedIn())
			{
				// Then we're probably trying to log in!
				var token = $stateParams.token;

				if(token !== 'undefined' && token.length > 0)
					auth.saveToken(token);

				// We definitely have to reload here...because we need to veriy afterwards when we're logged in, if the user has completed reg or not
				$window.location.reload();
			}
			else
			{
				$scope.user = user;

				if(user.destinationcity === '__undefined__')
				{
					// Go to finish registration
					$state.go('finishreg');
				}
				else
				{
					// Go to home
					$scope.refreshMain(); // hard refresh to re-load MainController
					$state.go('home');
				}
			}
		}]);
	
	app.controller('FinishregController', ['$scope', '$http', 'auth', 'user', '$state', '$window', function($scope, $http, auth, user, $state, $window) {
		
		if(user.destinationcity !== '__undefined__')
		{
			// Already finished...
			$state.go('home');
		}
		
		$scope.user = user;
	
		// Erase our default fields
		//WHY THIS?????
		$scope.user.destinationcity = '';
		$scope.user.destinationcountry = '';
		$scope.user.origincity = '';
		$scope.user.origincountry = '';
		$scope.user.age = '';
		$scope.user.gender = null;
		// Update our options
		$scope.updateOptions = function(){
			
			angular.element('#loadingwrap').css('display', 'flex');
			
			$http.post('/users/update', $scope.user, {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			}).then(function successCallback(response){
				data = response.data;
				
				$state.go('home');
				$scope.refreshMain(); // hard refresh to re-load MainController
				
			}, function errorCallback(response){
				data = response.data;
				$scope.error = { message: data };

				jQuery(document).ready(function(){
					// Scroll to top by default
					jQuery('html, body').animate({
					  scrollTop: 0
					});
				});
			});
		};
	}]);
	
	app.controller('AuthCtrl', ['$scope', '$state', 'auth', '$window', function($scope, $state, auth, $window){
		$scope.user = {};

		$scope.register = function(){
			
			angular.element('#loadingwrap').css('display', 'flex');
			
			auth.register($scope.user).error(function(error){
				$scope.error = error;
				
				jQuery(document).ready(function(){
					// Scroll to top by default
					jQuery('html, body').animate({
					  scrollTop: 0
					});
				});
			}).then(function(){
				$scope.refreshMain(); // hard refresh to re-load MainController
				$state.go('home');
			});
		};

		$scope.logIn = function(){
			auth.logIn($scope.user).error(function(error){
				$scope.error = error;
				
				jQuery(document).ready(function(){
					// Scroll to top by default
					jQuery('html, body').animate({
					  scrollTop: 0
					});
				});
			}).then(function(){
				$scope.refreshMain(); // hard refresh to re-load MainController
				$state.go('home');
			});
		};
	}]);

	app.controller('ProfileController', ['$scope', '$http', 'auth', 'profile', 'user', '$state', function($scope, $http, auth, profile, user, $state) {
		
		// User did not complete registration
		if(user.destinationcity === '__undefined__')
		{
			$state.go('finishreg');
		}
		
		$scope.profile = profile;
	}]);
	
	app.controller('NavCtrl', ['$scope', 'auth', function($scope, auth){
		$scope.isLoggedIn = auth.isLoggedIn;
		$scope.currentUser = auth.currentUser;
		$scope.logOut = auth.logOut;
	}]);
	
	app.controller('PictureController', ['$scope', 'auth', '$http', 'Upload', '$window',function($scope, auth, $http, Upload, $window){
		
		$http.get('/users/' + auth.currentUser(), {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).then(function(res){
			$scope.user = res.data;
		});
		
        var vm = this;
        vm.submit = function(){ //function to call on form submit
            if (vm.upload_form.file.$valid && vm.file) { //check if from is valid
                vm.upload(vm.file); //call upload function
            }
        }
       
        vm.upload = function (file) {
            Upload.upload({
                url: 'http://localhost:3000/users/update/picture', //webAPI exposed to upload the file
                data:{file:file}, //pass file as data, should be user ng-model
				headers: {Authorization: 'Bearer '+auth.getToken()}
            }).then(function (resp) { //upload function returns a promise
                $scope.uploadstatus = { success: resp.data.message };
				$scope.user.picture = 'pictures/'+resp.data.picture;
            }, function (resp) { //catch error
				$scope.uploadstatus = { error: resp.data };
            }, function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                $scope.progress = progressPercentage; // capture upload progress
            });
        };
    }]);
})();