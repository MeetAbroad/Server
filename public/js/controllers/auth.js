(function() {
    var app = angular.module('MeetAbroad');
	
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
})();