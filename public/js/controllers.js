(function() {
    var app = angular.module('MeetAbroad');
	
	app.controller('MainController', ['$scope', 'auth', '$http', function($scope, auth, $http) {
		
		if(auth.isLoggedIn())
		{
			// Our logged in styleSheets
			$scope.stylesheets = ['css/home.css'];
			
			$scope.resultsByDestinationCity = {};
			
			// Make user available to the whole app
			auth.getUser().then(function successCallback(response){
				data = response.data;
				$scope.user = data;
				
				// Make suggestions available to the whole app
				$http.get('/users/destinationcity/'+$scope.user.destinationcountry+'/'+$scope.user.destinationcity, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				}).then(function(response){
					suggestions = response.data;
					
					////// IMPORTANT: TODO this should probably be on the server-side...but meh...
					
					// Now get our connections so we can remove those users from this list
					$http.get('/connections/'+$scope.user._id, {
						headers: {Authorization: 'Bearer '+auth.getToken()}
					}).then(function successCallback(response){
							
	
							var connections = response.data;

							// Remove them
							for (var i = suggestions.length - 1; i >= 0; i--) {
								var s = suggestions[i];
								
								for (var j = connections.length - 1; j >= 0; j--) {
									var c = connections[j];
			
									if(
										(s._id == c.uid1 && c.uid2 == $scope.user._id)
										||
										(s._id == c.uid2 && c.uid1 == $scope.user._id)
									)
									{
										suggestions.splice(i, 1);
										break;
									}
								}
							}
							
							// We have our results now
							$scope.resultsByDestinationCity = suggestions;
							
						}, function errorCallback(response){
							// We have our results already
							$scope.resultsByDestinationCity = suggestions;
						}
					);
				});
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
				
				$http.post('/connections/new/'+id, $scope.user, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				}).then(function successCallback(response) {
					data = response.data;
					
					jQuery('#success_'+id+' span').text(data);
					jQuery('#success_'+id).slideToggle();
					jQuery('#send_'+id).remove();
					
					setTimeout(function() {
						jQuery('#row_'+id).slideToggle();
					}, 3000); // <-- time in milliseconds
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
	}]);
	
	app.controller('HomeController', ['$scope', '$http', 'auth', function($scope, $http, auth) {

    }]);

    app.controller('UserController', ['$scope', '$http', 'auth', function($scope, $http, auth) {
		
		$http.get('/users/'+auth.currentUser(), {
				headers: {Authorization: 'Bearer '+auth.getToken()}
		}).then(function(response){
			data = response.data;
			
			$scope.user = data;
		});
		
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
	
	
	app.controller('AuthCtrl', ['$scope', '$state', 'auth', '$window', function($scope, $state, auth, $window){
		$scope.user = {};

		$scope.register = function(){
			auth.register($scope.user).error(function(error){
				$scope.error = error;
			}).then(function(){
				//$state.go('home');
				$window.location.reload(); // hard refresh to re-load MainController
			});
		};

		$scope.logIn = function(){
			auth.logIn($scope.user).error(function(error){
				$scope.error = error;
			}).then(function(){
				//$state.go('home');
				$window.location.reload(); // hard refresh to re-load MainController
			});
		};
	}]);

	app.controller('ProfileController', ['$scope', '$http', 'auth', 'profile', function($scope, $http, auth, profile) {
		$scope.profile = profile;
	}]);
	
	app.controller('NotificationsController', ['$scope', '$http', 'auth', function($scope, $http, auth) {
		
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
		
	app.controller('NavCtrl', ['$scope', 'auth', function($scope, auth){
		$scope.isLoggedIn = auth.isLoggedIn;
		$scope.currentUser = auth.currentUser;
		$scope.logOut = auth.logOut;
	}]);
})();