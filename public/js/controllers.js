(function() {
    var app = angular.module('MeetAbroad');
	
	app.controller('MainController', ['$scope', 'auth', function($scope, auth) {
		
		// Our styleSheets
		if(auth.isLoggedIn())
			$scope.stylesheets = ['css/home.css'];
	}]);
	
	app.controller('HomeController', ['$scope', '$http', 'auth', function($scope, $http, auth) {

		$scope.resultsByDestinationCity = {};
		
		$http.get('http://localhost:3000/users/'+auth.currentUser(), {
				headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			$scope.user = data;
			
			$http.get('http://localhost:3000/users/destinationcity/'+$scope.user.destinationcity, {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			}).success(function(data){
				// We have our results now
				$scope.resultsByDestinationCity = data;
				
				console.log(data);
			});
		});
    }]);

    app.controller('UserController', ['$scope', '$http', 'auth', function($scope, $http, auth) {
		
		$http.get('http://localhost:3000/users/'+auth.currentUser(), {
				headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
			$scope.user = data;
		});
		
		$scope.refreshInterests = function(){
			
			$scope.selected = {};
			
			$http.get('http://localhost:3000/interests', {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			}).success(function(data){
				$scope.interests = data;
			});
			
			$http.get('http://localhost:3000/interests/'+auth.currentUser(), {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			}).success(function(data){
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
			}).success(function(data){
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
			}).error(function(){
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
			}).success(function(data){
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
				/*$http.get('http://localhost:3000/users/'+auth.currentUser(), {
						headers: {Authorization: 'Bearer '+auth.getToken()}
				}).success(function(data){
					$scope.user = data;
				});*/
			}).error(function(){
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

	app.controller('NavCtrl', ['$scope', 'auth', function($scope, auth){
		$scope.isLoggedIn = auth.isLoggedIn;
		$scope.currentUser = auth.currentUser;
		$scope.logOut = auth.logOut;
	}]);
})();