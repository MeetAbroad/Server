(function() {
    var app = angular.module('MeetAbroad');

    app.controller('UserController', ['$scope', '$http', 'auth', function($scope, $http, auth) {

        $http.get('http://localhost:3000/interests', {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
            $scope.interests = data;
        });
		
		$http.get('http://localhost:3000/interests/'+auth.currentUser(), {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		}).success(function(data){
            $scope.myinterests = data;
        });
		
		$scope.myinterest = function(interest){
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