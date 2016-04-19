(function() {
    var app = angular.module('MeetAbroad');
	
	app.controller('MainController', ['$scope', 'auth', '$http', '$state', function($scope, auth, $http, $state) {
		
		if(auth.isLoggedIn())
		{
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
						
						////// IMPORTANT: TODO this should probably be on the server-side...but meh...
						
						// Now get our connections so we can remove those users from this list
						$http.get('/connections/'+user._id, {
							headers: {Authorization: 'Bearer '+auth.getToken()}
						}).then(function successCallback(response){
								
		
								var connections = response.data;

								// Remove them
								for (var i = suggestions.length - 1; i >= 0; i--) {
									var s = suggestions[i];
									
									for (var j = connections.length - 1; j >= 0; j--) {
										var c = connections[j];
				
										if(
											(s._id == c.uid1 && c.uid2 == user._id)
											||
											(s._id == c.uid2 && c.uid1 == user._id)
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
				}
				else
				{
					// If current state != facebook -> go back to complete details page
					console.log($state.current);
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
	}]);
	
	app.controller('HomeController', ['$scope', '$http', 'auth', function($scope, $http, auth) {

    }]);

    app.controller('UserController', ['$scope', '$http', 'auth', 'user', function($scope, $http, auth, user) {
		
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
	
	app.controller('FacebookController', ['$state', '$scope', 'auth', 'user', function($state, $scope, auth, user){
		
		$scope.user = user;
		
		if($scope.regCompleted)
		{
			// Go to home
			$state.go('home');
		}
		else
		{
			// Erase our default fields
			$scope.user.destinationcity = '';
			$scope.user.destinationcountry = '';
			$scope.user.origincity = '';
			$scope.user.origincountry = '';
			$scope.user.age = '';
			
			// Update our options
			$scope.updateOptions = function(){
				
				$http.post('/users/update', $scope.user, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				}).then(function successCallback(response){
					data = response.data;
					
					$state.go('home');
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
		}
	}]);
})();