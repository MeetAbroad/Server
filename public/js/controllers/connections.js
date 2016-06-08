(function() {
    var app = angular.module('MeetAbroad');
	
	app.controller('ConnectionsController', ['$scope', '$http', 'auth', 'user', '$state', function($scope, $http, auth, user, $state) {
		
		// User did not complete registration
		if(user.destinationcity === '__undefined__')
		{
			$state.go('finishreg');
		}
		
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
					// Remove from scope
					for (var i=0; i<$scope.connections.length; i++) {

						if($scope.connections[i].connectionid == id)
						{
							$scope.connections.splice(i, 1);
							break;
						}
					}
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
})();