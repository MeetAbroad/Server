(function() {
    var app = angular.module('MeetAbroad');
	
	app.controller('MainController', ['$scope', 'auth', '$http', '$state', '$interval', function($scope, auth, $http, $state, $interval) {
		
		$scope.refreshMain = function(){
			
			// Our logged in styleSheets
			$scope.stylesheets = ['css/home.css'];
			
			if($scope.resultsByDestinationCity === undefined)
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
						
						// We have our results now (only update if it changed)
						if(suggestions != $scope.resultsByDestinationCity)
							$scope.resultsByDestinationCity = suggestions;
					});
				}
				
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
			});
			
			if($scope.resultsByDestinationCity === undefined)
				$scope.unreadNotifications = 0;
			
			$http.get('/notifications/total', {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			}).then(function(response){
				data = response.data;
				
				// Only update if it's different
				if($scope.unreadNotifications != data)
					$scope.unreadNotifications = data;
			});
		}
		
		if(auth.isLoggedIn())
		{
			$scope.refreshMain();
			
			// Set an interval for refreshing the main controller (5s) (will only start in 5s, that's why we refresh first)
			$interval(function() {
				$scope.refreshMain();
			}, 5000);
		}
	}]);
	
	app.controller('NavCtrl', ['$scope', 'auth', function($scope, auth){
		$scope.isLoggedIn = auth.isLoggedIn;
		$scope.currentUser = auth.currentUser;
		$scope.logOut = auth.logOut;
	}]);
})();