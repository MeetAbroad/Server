(function() {
    var app = angular.module('MeetAbroad');

	app.controller('ProfileController', ['$scope', '$http', 'auth', 'profile', 'user', '$state', function($scope, $http, auth, profile, user, $state) {
		
		// User did not complete registration
		if(user.destinationcity === '__undefined__')
		{
			$state.go('finishreg');
		}
		
		$scope.profile = profile;
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
                url: 'http://147.83.7.163:3000/users/update/picture', //webAPI exposed to upload the file
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