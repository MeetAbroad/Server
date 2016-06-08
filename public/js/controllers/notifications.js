(function() {
    var app = angular.module('MeetAbroad');
	
	app.controller('NotificationsController', ['$scope', '$http', 'auth', 'user', '$state', '$timeout', function($scope, $http, auth, user, $state, $timeout) {
		
		// User did not complete registration
		if(user.destinationcity === '__undefined__')
		{
			$state.go('finishreg');
		}
		
		$scope.user = user;
		
		$scope.notifications = {notifications:[], total: 0};
		
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
				
				$timeout(function() {
					$scope.notifications.total--;
				}, 2000);
				
				$scope.refreshMain(); // Refresh MainController
				
			}, function errorCallback(response) {
				data = response.data;
				
				jQuery('#reject_'+id).slideToggle();
				jQuery('#accept_'+id).slideToggle();
				
				jQuery('#error_'+id+' span').text(data);
				jQuery('#error_'+id).slideToggle();
			});
		};
		
		// Reject request
		$scope.rejectRequest = function(id){
			
			$http.post('/connections/reject/'+id, $scope.user, {
				headers: {Authorization: 'Bearer '+auth.getToken()}
			}).then(function successCallback(response) {
				data = response.data;
				
				$scope.notifications.total--;

				jQuery('#reject_'+id).slideToggle();
				jQuery('#accept_'+id).slideToggle();
				
				jQuery('#success_'+id+' span').text(data);
				jQuery('#success_'+id).slideToggle();

				$timeout(function() {
					$scope.notifications.total--;
				}, 2000);
				
				$scope.refreshMain(); // Refresh MainController
				
			}, function errorCallback(response) {
				data = response.data;
				
				jQuery('#reject_'+id).slideToggle();
				jQuery('#accept_'+id).slideToggle();
				
				jQuery('#error_'+id+' span').text(data);
				jQuery('#error_'+id).slideToggle();
			});
		};
	}]);
})();