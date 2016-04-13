(function() {
    var app = angular.module('MeetAbroad');
	
	app.controller('MainController', ['$scope', 'auth', function($scope, auth) {
		
		// Our styleSheets
		if(auth.isLoggedIn())
			$scope.stylesheets = ['css/home.css'];
	}]);
	
	app.controller('HomeController', ['$scope', '$http', 'auth', function($scope, $http, auth) {
		
		$scope.getToken = auth.getToken();

		$scope.resultsByDestinationCity = {};
		
		$http.get('/users/'+auth.currentUser(), {
				headers: {Authorization: 'Bearer '+auth.getToken()}
		}).then(function successCallback(response){
			data = response.data;
			
			$scope.user = data;
			
			console.log(data);
			
			$http.get('/users/destinationcity/'+$scope.user.destinationcity, {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			}).then(function(response){
				suggestions = response.data;
				
				////// IMPORTANT: TODO this should probably be on the server-side...but meh...
				
				// Now get our connections so we can remove those users from this list
				$http.get('/connections/'+$scope.user._id, {
					headers: {Authorization: 'Bearer '+auth.getToken()}
				}).then(function(response){
					
					var connections = response.data;
					
					angular.forEach(suggestions, function(s, key) {
						angular.forEach(connections, function(c, index) {
							if(
								(s._id == c.uid1 && c.uid2 == $scope.user._id)
								||
								(s._id == c.uid2 && c.uid1 == $scope.user._id)
							)
								suggestions.splice(index, 1);
								
						});
					});
							
					// We have our results now
					$scope.resultsByDestinationCity = suggestions;
				});
			});
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
	
	
	app.controller('AuthCtrl', ['$scope', '$state', 'auth', function($scope, $state, auth){
		$scope.user = {};

		$scope.register = function(){
			auth.register($scope.user).error(function(error){
				$scope.error = error;
			}).then(function(){
				$state.go('home');
			});
		};

		$scope.logIn = function(){
			auth.logIn($scope.user).error(function(error){
				$scope.error = error;
			}).then(function(){
				$state.go('home');
			});
		};
	}]);

	app.controller('ProfileController', ['$scope', '$http', 'auth', 'profile', function($scope, $http, auth, profile) {
		$scope.profile = profile;
	}]);
		
	app.controller('NavCtrl', ['$scope', 'auth', function($scope, auth){
		$scope.isLoggedIn = auth.isLoggedIn;
		$scope.currentUser = auth.currentUser;
		$scope.logOut = auth.logOut;
	}]);
})();